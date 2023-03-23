import { PanelType } from './SwitchPanel';

export type SortOption = {
  label: string,
  icon: {
    asc: string,
    desc: string
  },
  func: {
    asc: (a: any, b: any) => number,
    desc: (a: any, b: any) => number
  }
}

export function switchSortOptions(panel: PanelType): SortOption[] {
  switch (panel) {
    case PanelType.STUDENTS:
      return [
        { 
          label: 'Name', 
          icon: {
            asc: 'mdi-sort-alphabetical-ascending',
            desc: 'mdi-sort-alphabetical-descending'
          },
          func: {
            asc: (a: any, b: any) => a.name.localeCompare(b.name),
            desc: (a: any, b: any) => b.name.localeCompare(a.name)
          }
        },
        { 
          label: 'Points',
          icon: {
            asc: 'mdi-sort-numeric-ascending',
            desc: 'mdi-sort-numeric-descending'
          },
          func: {
            asc: (a: any, b: any) => a.points - b.points,
            desc: (a: any, b: any) => b.points - a.points
          }
        },
        { 
          label: 'Active Status', 
          icon: {
            asc: 'mdi-sort-ascending',
            desc: 'mdi-sort-descending'
          },
          func: {
            asc: (a: any, b: any) => a.activeStatus.localeCompare(b.activeStatus),
            desc: (a: any, b: any) => b.activeStatus.localeCompare(a.activeStatus)
          }
        },
      ];
    case PanelType.GRADUATES:
      return []
    case PanelType.MODULES:
      return []
    default:
      throw new Error('switchSortOptions: Invalid panel type');
  }
}