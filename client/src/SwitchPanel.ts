import StudentDetail from '../src/components/StudentDetail.vue';
import { mapStudents, mapGraduates, mapModules } from './DataMappers';

export enum PanelType {
  STUDENTS = 'students',
  GRADUATES = 'graduates',
  MODULES = 'modules',
}

export type Panel = {
  detailComponent: any,
  title: string,
  color: string,
  icon: string,
  sheetRange: string,
  mapData: (sheetData: any[][]) => Object[]
};

export function switchPanel(panel: PanelType): Panel {
  switch (panel) {
    case PanelType.GRADUATES:
      return {
        detailComponent: StudentDetail,
        title: 'Graduates',
        color: 'purple',
        icon: 'mdi-account-school',
        sheetRange: 'Graduates',
        mapData: mapGraduates
      };
    case PanelType.STUDENTS:
      return {
        detailComponent: StudentDetail,
        title: 'Students',
        color: 'blue',
        icon: 'mdi-account-group',
        sheetRange: 'Students',
        mapData: mapStudents
      };
    case PanelType.MODULES:
      return {
        detailComponent: StudentDetail,
        title: 'Modules',
        color: 'orange',
        icon: 'mdi-book-open-variant',
        sheetRange: 'Modules',
        mapData: mapModules
      };
    default:
      throw new Error('switchPanel: Invalid panel type');
  }
}