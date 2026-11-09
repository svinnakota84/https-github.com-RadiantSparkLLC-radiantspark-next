import { AI_EMPLOYEES } from '../data/aiEmployeesData';
export async function askAiBrain(_prompt:string, employeeId?:string) {
 const employee=AI_EMPLOYEES.find(e=>e.id===employeeId)||AI_EMPLOYEES[0];
 return {employeeName:employee.name,employeeRole:employee.role,response:'Planning assistant only. No AI service or business system is connected. No invoice, payment, purchase, shipment, legal filing or customer message has been created. Record a task in the operations planner for owner review.',source:'planning-only' as const};
}
