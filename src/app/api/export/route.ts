import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { channelsVisibleTo, enrichChannel } from "@/lib/db-helpers";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (!["manager", "employee"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const channels = await channelsVisibleTo(Number(user.id), user.role);
  const data = (await Promise.all(channels.map(enrichChannel))).filter(Boolean) as any[];

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Channel Report");

  ws.addRow(["#", "Channel", "Country", "Category", "Subscribers", "Total Views", "Videos", "Avg Views", "Engagement %", "Added By", "URL"]);
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };

  data.forEach((row, i) => {
    ws.addRow([
      i + 1, row.channelName, row.country, row.category,
      row.subscribers, row.totalViews, row.videoCount,
      row.avgViews, row.engagementRate, row.addedBy, row.url,
    ]);
  });

  ws.columns = [
    { width: 4 }, { width: 28 }, { width: 10 }, { width: 14 },
    { width: 16 }, { width: 16 }, { width: 10 }, { width: 14 },
    { width: 16 }, { width: 14 }, { width: 42 },
  ];

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="youtube_report.xlsx"',
    },
  });
}
