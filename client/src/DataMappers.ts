
export function mapStudents(sheetData: any[][]) {
  // get header row categories
  const categories = sheetData[0].slice(6).filter(category => category !== '')
  return sheetData
    .slice(1) // remove header row
    .map((row, index) => ({
      row: index + 2, // + 1 for header row, + 1 for 0-indexing
      name: row[0] ?? '',
      id: row[1] ?? '',
      email: row[2] ?? '',
      points: row[3] ?? 0,
      activeStatus: row[4] ?? '',
      note: row[5] ?? '',
      misc: categories.reduce((acc, category, index) => {
        acc[category] = row[index + 6] ?? ''
        return acc
      }, {})
  }))
}

export function mapModules(sheetData: any[][]): Object[] {
  return sheetData.map((module: any) => {
    return {
      id: module[0],
      name: module[1],
      code: module[2],
      points: module[3],
      row: module[4],
    };
  });
}

export function mapGraduates(sheetData: any[][]): Object[] {
  return sheetData.map((graduate: any) => {
    return {
      id: graduate[0],
      name: graduate[1],
      email: graduate[2],
      phone: graduate[3],
      course: graduate[4],
      year: graduate[5],
      points: graduate[6],
      row: graduate[7],
    };
  });
}