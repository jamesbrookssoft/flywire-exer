package com.flywire.exercise;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Comparator;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class EmployeeController
{

    String dataFilePath = "json/data.json";
  @RequestMapping(value = "/employees/", method = { RequestMethod.GET })
  public ResponseEntity<List<Employee>> getAllEmployees() throws IOException
  {
      ObjectMapper objectMapper = new ObjectMapper();
      List<Employee> employees = objectMapper.readValue(new ClassPathResource(dataFilePath).getFile(),
        new TypeReference<List<Employee>>() {
      });
      return ResponseEntity.ok(employees);
  }

  @GetMapping("/employees/active")
  public ResponseEntity<List<Employee>> getActiveEmployeesOrderedByLastName() throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    List<Employee> employees = objectMapper.readValue(new ClassPathResource(dataFilePath).getFile(),
        new TypeReference<List<Employee>>() {
        });

    List<Employee> activeEmployeesOrderedByLastName = employees.stream()
        .filter(Employee::isActive)
        .sorted(Comparator.comparing(employee -> employee.getName().split(" ")[1]))
        .collect(Collectors.toList());

    return ResponseEntity.ok(activeEmployeesOrderedByLastName);
  }
  
  @GetMapping("/employees/{id}")
  public ResponseEntity<Map<String, Object>> getEmployeeWithDirectHires(@PathVariable int id) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    List<Employee> employees = objectMapper.readValue(new ClassPathResource(dataFilePath).getFile(),
        new TypeReference<List<Employee>>() {
        });

    Employee employee = employees.stream()
        .filter(e -> e.getId() == id)
        .findFirst()
        .orElse(null);

    if (employee == null) {
      return ResponseEntity.notFound().build();
    }

    List<String> directHireNames = employees.stream()
        .filter(e -> employee.getDirectReports().contains(e.getId()))
        .map(Employee::getName)
        .collect(Collectors.toList());

    Map<String, Object> response = Map.of(
        "employee", employee,
        "directHires", directHireNames);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/employees/hired")
  public ResponseEntity<List<Employee>> getEmployeesHiredInDateRange(
          @RequestParam String startDate,
      @RequestParam String endDate) throws IOException {
    ObjectMapper objectMapper = new ObjectMapper();
    List<Employee> employees = objectMapper.readValue(new ClassPathResource(dataFilePath).getFile(),
        new TypeReference<List<Employee>>() {
        });

    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    LocalDate start = LocalDate.parse(startDate, formatter);
    LocalDate end = LocalDate.parse(endDate, formatter);

    List<Employee> employeesHiredInRange = employees.stream()
        .filter(e -> {
          LocalDate hireDate = LocalDate.parse(e.getHireDate(), formatter);
          return !hireDate.isBefore(start) && !hireDate.isAfter(end);
        })
        .sorted((e1, e2) -> e2.getHireDate().compareTo(e1.getHireDate()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(employeesHiredInRange);
  }

  @PostMapping("/employees")
  public ResponseEntity<String> createEmployee(@RequestBody Employee employee) throws IOException {
      ObjectMapper objectMapper = new ObjectMapper();
      List<Employee> employees = objectMapper.readValue(new ClassPathResource(dataFilePath).getFile(),
              new TypeReference<List<Employee>>() {});

      if (employee.getName() == null || employee.getName().trim().isEmpty()) {
          return ResponseEntity.badRequest().body("Name is required");
      }

      if (employee.getPosition() == null || employee.getPosition().trim().isEmpty()) {
          return ResponseEntity.badRequest().body("Position is required");
      }

      if (employee.getHireDate() == null || employee.getHireDate().trim().isEmpty()) {
          return ResponseEntity.badRequest().body("Hire Date is required");
      }

      if (employees.stream().anyMatch(e -> e.getId() == employee.getId())) {
          return ResponseEntity.badRequest().body("Employee ID already exists");
      }

      if (employee.getDirectReports() != null) {
          for (Integer directReportId : employee.getDirectReports()) {
              if (!employees.stream().anyMatch(e -> e.getId() == directReportId)) {
                  return ResponseEntity.badRequest().body("Invalid direct report ID: " + directReportId);
              }
          }
      }

      employees.add(employee);

      Path dataJsonPath = Paths.get("src/main/resources/json/data.json");
      String updatedEmployeesJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(employees);
      Files.write(dataJsonPath, updatedEmployeesJson.getBytes(), StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);

      return ResponseEntity.ok("Employee created successfully");
  }

  @PutMapping("/employees/{id}/deactivate")
  public ResponseEntity<String> deactivateEmployee(@PathVariable int id) throws IOException {
      ObjectMapper objectMapper = new ObjectMapper();
      List<Employee> employees = objectMapper.readValue(new ClassPathResource(dataFilePath).getFile(),
              new TypeReference<List<Employee>>() {});

      Employee employee = employees.stream()
              .filter(e -> e.getId() == id)
              .findFirst()
              .orElse(null);

      if (employee == null) {
          return ResponseEntity.notFound().build();
      }

      if (!employee.isActive()) {
          return ResponseEntity.badRequest().body("Employee is already inactive");
      }

      employee.setActive(false);

      Path dataJsonPath = Paths.get("src/main/resources/json/data.json");
      String updatedEmployeesJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(employees);
      Files.write(dataJsonPath, updatedEmployeesJson.getBytes(), StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);

      return ResponseEntity.ok("Employee deactivated successfully");
  }

}
