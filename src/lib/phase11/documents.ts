import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  academicClasses,
  classSections,
  documentTemplates,
  generatedDocuments,
  studentEnrollments,
  students,
  tenants,
} from "@/lib/db";
import { withTenant } from "@/lib/rls";
import { Phase11Error, renderTemplate } from "./shared";

const TRANSFER_CERTIFICATE_TEMPLATE = `<!doctype html>
<html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:32px}.header{text-align:center;margin-bottom:24px}.school{font-size:22px;font-weight:700}.title{font-size:18px;text-decoration:underline;margin-top:18px}.row{display:flex;margin:12px 0}.label{width:190px;font-weight:700}.value{flex:1;border-bottom:1px solid #333;min-height:18px}.signatures{display:flex;justify-content:space-between;margin-top:72px}
</style></head><body>
<div class="header"><div class="school">{{school.name}}</div><div>{{school.address}}</div><div>{{school.phone}} {{school.email}}</div><div class="title">TRANSFER CERTIFICATE</div><div>Document No: {{document_number}} · Date: {{issue_date}}</div></div>
<div class="row"><div class="label">Student Name:</div><div class="value">{{student_name}}</div></div>
<div class="row"><div class="label">Admission No:</div><div class="value">{{admission_number}}</div></div>
<div class="row"><div class="label">Date of Birth:</div><div class="value">{{date_of_birth}}</div></div>
<div class="row"><div class="label">Class & Section:</div><div class="value">{{class_name}} - {{section_name}}</div></div>
<div class="row"><div class="label">Reason for Leaving:</div><div class="value">{{reason}}</div></div>
<div class="row"><div class="label">Conduct:</div><div class="value">{{conduct}}</div></div>
<div class="signatures"><div>Class Teacher</div><div>Principal</div></div>
</body></html>`;

const BONAFIDE_TEMPLATE = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;padding:40px}.header{text-align:center}.school{font-size:22px;font-weight:700}.title{text-align:center;font-size:18px;text-decoration:underline;margin:28px}.body{line-height:1.8;font-size:14px}.signature{text-align:right;margin-top:80px}</style></head><body><div class="header"><div class="school">{{school.name}}</div><div>{{school.address}}</div></div><div class="title">BONAFIDE CERTIFICATE</div><div class="body">This is to certify that <b>{{student_name}}</b>, admission number <b>{{admission_number}}</b>, is a bonafide student of class <b>{{class_name}} {{section_name}}</b> at {{school.name}}.</div><div class="signature">Principal</div></body></html>`;

export async function seedDefaultDocumentTemplates(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    return tx.insert(documentTemplates).values([
      {
        tenantId,
        name: "Transfer Certificate",
        documentType: "transfer_certificate",
        htmlTemplate: TRANSFER_CERTIFICATE_TEMPLATE,
        variables: ["student_name", "admission_number", "date_of_birth", "class_name", "section_name", "reason", "conduct"],
        isDefault: true,
      },
      {
        tenantId,
        name: "Bonafide Certificate",
        documentType: "bonafide_certificate",
        htmlTemplate: BONAFIDE_TEMPLATE,
        variables: ["student_name", "admission_number", "class_name", "section_name"],
        isDefault: true,
      },
    ]).onConflictDoNothing().returning();
  });
}

function pdfBytesFromText(text: string) {
  const safe = text.replace(/[()\\]/g, "\\$&").replace(/\r?\n/g, " ");
  const lines = safe.match(/.{1,88}/g) ?? [safe];
  let y = 780;
  const content = ["BT", "/F1 10 Tf"];
  for (const line of lines.slice(0, 60)) {
    content.push(`50 ${y} Td (${line}) Tj`);
    y = -14;
  }
  content.push("ET");
  const stream = content.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj\n`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(body));
    body += object;
  }
  const xref = Buffer.byteLength(body);
  body += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  body += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body, "utf8");
}

async function writeDocumentPdf(tenantId: string, fileName: string, html: string) {
  const dir = path.join(process.cwd(), "generated-files", tenantId, "documents");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), pdfBytesFromText(html.replace(/<[^>]+>/g, " ")));
  return `/generated-files/${tenantId}/documents/${fileName}`;
}

export async function listDocumentsModel(tenantId: string) {
  await seedDefaultDocumentTemplates(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [templates, documents] = await Promise.all([
      tx.select().from(documentTemplates).where(eq(documentTemplates.tenantId, tenantId)).orderBy(asc(documentTemplates.name)),
      tx.select({
        id: generatedDocuments.id,
        documentNumber: generatedDocuments.documentNumber,
        pdfUrl: generatedDocuments.pdfUrl,
        status: generatedDocuments.status,
        generatedAt: generatedDocuments.generatedAt,
        studentName: students.firstName,
        admissionNumber: students.admissionNumber,
        templateName: documentTemplates.name,
      }).from(generatedDocuments)
        .innerJoin(students, eq(students.id, generatedDocuments.studentId))
        .innerJoin(documentTemplates, eq(documentTemplates.id, generatedDocuments.templateId))
        .where(eq(generatedDocuments.tenantId, tenantId))
        .orderBy(desc(generatedDocuments.generatedAt)),
    ]);
    return { templates, documents };
  });
}

export async function generateStudentDocument(tenantId: string, actorUserId: string, input: {
  studentId: string;
  templateId: string;
  customFields?: Record<string, string>;
}) {
  await seedDefaultDocumentTemplates(tenantId);
  return withTenant(tenantId, async (tx) => {
    const [template] = await tx.select().from(documentTemplates)
      .where(and(eq(documentTemplates.tenantId, tenantId), eq(documentTemplates.id, input.templateId), eq(documentTemplates.isActive, true)))
      .limit(1);
    if (!template) throw new Phase11Error("Document template not found.", 404);
    const [student] = await tx.select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      admissionNumber: students.admissionNumber,
      dateOfBirth: students.dateOfBirth,
      className: academicClasses.name,
      sectionName: classSections.name,
    }).from(students)
      .leftJoin(studentEnrollments, and(eq(studentEnrollments.studentId, students.id), eq(studentEnrollments.status, "active")))
      .leftJoin(academicClasses, eq(academicClasses.id, studentEnrollments.classId))
      .leftJoin(classSections, eq(classSections.id, studentEnrollments.sectionId))
      .where(and(eq(students.tenantId, tenantId), eq(students.id, input.studentId)))
      .limit(1);
    if (!student) throw new Phase11Error("Student not found.", 404);
    const [school] = await tx.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    const [{ value }] = await tx.select({ value: sql<number>`count(*)::int` }).from(generatedDocuments).where(eq(generatedDocuments.tenantId, tenantId));
    const prefix = template.documentType === "transfer_certificate" ? "TC" : "DOC";
    const documentNumber = `${prefix}/${new Date().getFullYear()}/${String((value ?? 0) + 1).padStart(3, "0")}`;
    const snapshot = {
      school,
      document_number: documentNumber,
      issue_date: new Date().toISOString().slice(0, 10),
      student_name: `${student.firstName} ${student.lastName ?? ""}`.trim(),
      admission_number: student.admissionNumber,
      date_of_birth: student.dateOfBirth ?? "",
      class_name: student.className ?? "",
      section_name: student.sectionName ?? "",
      reason: input.customFields?.reason ?? "",
      conduct: input.customFields?.conduct ?? "Good",
      ...(input.customFields ?? {}),
    };
    const html = renderTemplate(template.htmlTemplate, snapshot);
    const pdfUrl = await writeDocumentPdf(tenantId, `${documentNumber.replace(/[^A-Za-z0-9_-]/g, "_")}.pdf`, html);
    const [document] = await tx.insert(generatedDocuments).values({
      tenantId,
      studentId: student.id,
      templateId: template.id,
      documentNumber,
      pdfUrl,
      status: "generated",
      snapshotData: snapshot,
      generatedBy: actorUserId,
    }).returning();
    return { document, html };
  });
}
