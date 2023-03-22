import StudentDetail from '../src/components/StudentDetail.vue';

export enum PanelType {
  GRADUATES = 'graduates',
  STUDENTS = 'students',
}

export type Panel = {
  detailComponent: any,
  title: string,
  color: string,
  icon: string,
};

export function switchPanel(panel: PanelType): Panel {
  switch (panel) {
    case PanelType.GRADUATES:
      return {
        detailComponent: StudentDetail,
        title: 'Graduates',
        color: 'purple',
        icon: 'mdi-account-multiple-check',
      };
    case PanelType.STUDENTS:
      return {
        detailComponent: StudentDetail,
        title: 'Students',
        color: 'blue',
        icon: 'mdi-account-multiple',
      };
    default:
      return {
        detailComponent: StudentDetail,
        title: 'Students',
        color: 'blue',
        icon: 'mdi-account-multiple',
      };
  }
}