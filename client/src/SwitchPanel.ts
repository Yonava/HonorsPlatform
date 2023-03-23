import StudentDetail from '../src/components/StudentDetail.vue';
import StudentListItem from '../src/components/StudentListItem.vue';
import ModuleListItem from '../src/components/ModuleListItem.vue';
// import ModuleDetail from '../src/components/ModuleDetail.vue';
// import 
import { mapStudents, mapGraduates, mapModules } from './DataMappers';

export enum PanelType {
  STUDENTS = 'students',
  GRADUATES = 'graduates',
  MODULES = 'modules',
}

export type Panel = {
  detailComponent: any,
  listItemComponent: any,
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
        listItemComponent: StudentListItem,
        title: 'Graduates',
        color: 'purple',
        icon: 'mdi-account-school',
        sheetRange: 'Graduates',
        mapData: mapGraduates
      };
    case PanelType.STUDENTS:
      return {
        detailComponent: StudentDetail,
        listItemComponent: StudentListItem,
        title: 'Students',
        color: 'blue',
        icon: 'mdi-account-group',
        sheetRange: 'Students',
        mapData: mapStudents
      };
    case PanelType.MODULES:
      return {
        detailComponent: StudentDetail,
        listItemComponent: ModuleListItem,
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