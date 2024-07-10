import axios from "axios";

const EMPLOYEE_API_BASE_URL = "/employees";

class EmployeeService {
  getAllEmployees() {
    return axios.get(`${EMPLOYEE_API_BASE_URL}/`);
  }
  getActiveEmployees() {
    return axios.get(`${EMPLOYEE_API_BASE_URL}/active`);
  }

  getEmployeeById(id) {
    return axios.get(`${EMPLOYEE_API_BASE_URL}/${id}`);
  }

  getEmployeesByHireDate(startDate, endDate) {
    return axios.get(
      `${EMPLOYEE_API_BASE_URL}/hired?startDate=${startDate}&endDate=${endDate}`
    );
  }

  createEmployee(employee) {
    return axios.post(`${EMPLOYEE_API_BASE_URL}/`, employee);
  }

  deactivateEmployee(id) {
    return axios.put(`${EMPLOYEE_API_BASE_URL}/${id}/deactivate`);
  }
}

const employeeService = new EmployeeService();
export default employeeService;