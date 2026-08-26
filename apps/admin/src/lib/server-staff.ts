// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getStaffServer, addStaffServer, editStaffServer, archiveStaffServer, updateStaffStatusServer } from './api-staff';

// Type definitions preserved from original server module
export interface StaffListItem {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  designation: string;
  salary: number;
  shift: string;
  joiningDate: string;
  status: string;
}

