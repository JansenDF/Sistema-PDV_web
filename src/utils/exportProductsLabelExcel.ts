import ExcelJS from "exceljs";

function formatBrl(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n)
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)
    : "";
}

const borderSide: ExcelJS.Border = {
  style: "thin",
  color: { argb: "FF333333" },
};

function writeEtiquetaCell(
  sheet: ExcelJS.Worksheet,
  col: number,
  startRow: number,
  description: string,
  priceStr: string
) {
  const desc = description.toUpperCase();

  const rowDesc = sheet.getRow(startRow);
  const cellDesc = rowDesc.getCell(col);
  cellDesc.value = desc || "—";
  cellDesc.font = { name: "Calibri", size: 10 };
  cellDesc.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  cellDesc.border = {
    top: borderSide,
    left: borderSide,
    right: borderSide,
    bottom: borderSide,
  };
  rowDesc.height = 24;

  const rowPrice = sheet.getRow(startRow + 1);
  const cellPrice = rowPrice.getCell(col);
  cellPrice.value = priceStr || "—";
  cellPrice.font = { name: "Calibri", size: 22, bold: true };
  cellPrice.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: false,
  };
  cellPrice.border = {
    left: borderSide,
    right: borderSide,
    bottom: borderSide,
  };
  rowPrice.height = 36;
}

/**
 * Três colunas (A, B e C) por linha de etiquetas para economizar papel ao imprimir.
 * Cada bloco: linha descrição + linha preço; próximo par na linha seguinte (com espaço).
 */
export async function exportProductsLabelExcel(products: any[]) {
  const list = Array.isArray(products) ? products : [];
  const etiquetas = list.map((p) => ({
    description: String(p?.description ?? "").trim(),
    price: p?.price,
  }));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Etiquetas", {
    properties: { defaultColWidth: 15 },
  });

  sheet.columns = [
    { key: "col1", width: 24 },
    { key: "col2", width: 24 },
    { key: "col3", width: 24 },
  ];

  let rowNum = 1;

  for (let i = 0; i < etiquetas.length; i += 3) {
    const col1 = etiquetas[i];
    const col2 = etiquetas[i + 1];
    const col3 = etiquetas[i + 2];

    const priceCol1 = formatBrl(col1.price);
    writeEtiquetaCell(sheet, 1, rowNum, col1.description, priceCol1);

    if (col2) {
      const priceCol2 = formatBrl(col2.price);
      writeEtiquetaCell(sheet, 2, rowNum, col2.description, priceCol2);
    }

    if (col3) {
      const priceCol3 = formatBrl(col3.price);
      writeEtiquetaCell(sheet, 3, rowNum, col3.description, priceCol3);
    }

    rowNum += 2;
    sheet.getRow(rowNum).height = 8;
    rowNum += 1;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `etiquetas_descricao_preco_${stamp}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
