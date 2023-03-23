
export function mapStudents(sheetData: any[][], removeHeaderRow = true): Object[] {
  // get header row categories
  const categories = sheetData[0].slice(6).filter(category => category !== '')
  if (removeHeaderRow) sheetData.shift()
  return sheetData
    .map((student, index) => ({
      row: index + (removeHeaderRow ? 2 : 1), // + 1 for header row, + 1 for 0-indexing
      name: student[0] ?? '',
      id: student[1] ?? '',
      email: student[2] ?? '',
      points: student[3] ?? 0,
      activeStatus: student[4] ?? '',
      note: student[5] ?? '',
      misc: categories.reduce((acc, category, index) => {
        acc[category] = student[index + 6] ?? ''
        return acc
      }, {})
    }))
    .filter(student => {
      return Object
        .values(student)
        .some(value => typeof value === 'string' && value.length > 0);
    });
}

export function mapModules(sheetData: any[][], removeHeaderRow = true): Object[] {
  if (removeHeaderRow) sheetData.shift()
  return sheetData
    .map((module, index) => {
      return {
        row: index + (removeHeaderRow ? 2 : 1),
        studentId: module[0] ?? '',
        courseCode: module[1] ?? '',
        description: module[2] ?? '',
        term: module[3] ?? '',
      };
    })
    .filter(module => {
      return Object
        .values(module)
        .some(value => typeof value === 'string' && value.length > 0);
    });
}

export function mapGraduates(sheetData: any[][], removeHeaderRow = true): Object[] {
  if (removeHeaderRow) sheetData.shift()
  return sheetData.map((graduate: any, index: number) => {
    return {
      row: index + (removeHeaderRow ? 2 : 1),
      name: graduate[0],
      phone: graduate[1],
    };
  });
}