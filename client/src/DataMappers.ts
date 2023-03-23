
export function mapStudents(sheetData: any[][]): Object[] {
  // get header row categories
  const categories = sheetData[0].slice(6).filter(category => category !== '')
  return sheetData
    .slice(1) // remove header row
    .map((student, index) => ({
      row: index + 2, // + 1 for header row, + 1 for 0-indexing
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
}

export function mapModules(sheetData: any[][]): Object[] {
  return sheetData.slice(1).map((module, index) => {
    return {
      row: index + 2,
      studentId: module[0],
      courseCode: module[1],
      description: module[2],
      term: module[3],
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