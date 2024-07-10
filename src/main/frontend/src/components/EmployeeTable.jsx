import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  DialogActions,
  Box,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import HideSourceIcon from "@mui/icons-material/HideSource";
import BadgeIcon from "@mui/icons-material/Badge";
import toast from "react-hot-toast";
import EmployeeService from "../hooks/EmployeeService";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [viewMode, setViewMode] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [open, setOpen] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [selectedDirectReports, setSelectedDirectReports] = useState([]);
  const [hireDate, setHireDate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    position: "",
    directReports: [],
    manager: "",
    hireDate: null,
  });

  useEffect(() => {
    EmployeeService.getAllEmployees()
      .then((response) => {
        setEmployees(response.data);
        setAllEmployees(response.data);
      })
      .catch((error) => {
        toast.error(error.response.data);
      });
  }, []);

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFormData({
      name: "",
      id: "",
      position: "",
      directReports: [],
      manager: "",
      hireDate: null,
    });
    setSelectedDirectReports([]);
    setHireDate(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = async () => {
    if (
      !formData.name ||
      !formData.id ||
      !formData.position ||
      !formData.hireDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        directReports: selectedDirectReports,
        hireDate: hireDate.format("MM/DD/YYYY"),
      };

      EmployeeService.createEmployee(updatedFormData)
        .then((response) => {
          toast.success(response.data);
          handleCloseDialog();
          setEmployees([...employees, updatedFormData]);
        })
        .catch((error) => {
          toast.error(error.response.data);
        });
    } catch (error) {
      toast.error(error.response.data);
    }
  };

  const handleDateRangeChange = (newValue) => {
    setDateRange(newValue);
  };

  const handleViewModeChange = (e) => {
    const mode = e.target.value;
    setViewMode(mode);
    updateView(mode);
  };

  const updateView = (mode) => {
    if (mode === "all") {
      EmployeeService.getAllEmployees()
        .then((response) => {
          setEmployees(response.data);
        })
        .catch((error) => {
          toast.error(error.response.data);
        });
    } else if (mode === "active") {
      EmployeeService.getActiveEmployees()
        .then((response) => {
          setEmployees(response.data);
        })
        .catch((error) => {
          toast.error(error.response.data);
        });
    }
  };

  const handleDeactivateEmployee = (id) => {
    EmployeeService.deactivateEmployee(id)
      .then(() => {
        toast.success("Employee deactivated successfully");
        setEmployees(
          employees.map((employee) => {
            if (employee.id === id) {
              employee.active = false;
            }
            return employee;
          })
        );
      })
      .catch((error) => {
        toast.error(error.response.data);
      });
  };

  const getEmployeesByHireDate = () => {
    try {
      EmployeeService.getEmployeesByHireDate(
        dateRange[0].format("MM/DD/YYYY"),
        dateRange[1].format("MM/DD/YYYY")
      )
        .then((response) => {
          setEmployees(response.data);
        })
        .catch((error) => {
          toast.error(error.response.data);
        });
    } catch (error) {
      toast.error("Please select a valid date range");
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenDialog}
            >
              Add Employee
            </Button>
            <FormControl component="fieldset">
              <FormLabel component="legend">Show Mode</FormLabel>
              <RadioGroup
                aria-label="show-mode"
                name="show-mode"
                value={viewMode}
                onChange={handleViewModeChange}
                row
              >
                <FormControlLabel value="all" control={<Radio />} label="All" />
                <FormControlLabel
                  value="active"
                  control={<Radio />}
                  label="Active"
                />
                <FormControlLabel
                  value="date"
                  control={<Radio />}
                  label="Date Range"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Grid>
        {viewMode === "date" && (
          <Grid container spacing={2} sx={{ margin: "20px" }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateRangePicker
                  slots={{ field: SingleInputDateRangeField }}
                  name="allowedRange"
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={getEmployeesByHireDate}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        )}
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Position</TableCell>
                <TableCell align="right">Hire Date</TableCell>
                <TableCell align="right">Active</TableCell>
                <TableCell align="right">Controls</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 && (
                  <div
                    style={{ padding: "auto", margin: "20px"}}
                  >
                    No employees found
                  </div>
              )}
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell align="right">{employee.position}</TableCell>
                  <TableCell align="right">{employee.hireDate}</TableCell>
                  <TableCell align="right">
                    {employee.active ? "Active" : ""}
                  </TableCell>
                  <TableCell align="right">
                    {employee.active ? (
                      <Tooltip title="Deactivate employee" arrow>
                        <IconButton
                          aria-label="deactivate employee"
                          size="small"
                          onClick={() => handleDeactivateEmployee(employee.id)}
                        >
                          <HideSourceIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <></>
                    )}
                    <Tooltip title="Direct hires" arrow>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => {
                          EmployeeService.getEmployeeById(employee.id)
                            .then((data) => setExpandedEmployee(data.data))
                            .catch((error) => console.error(error));
                        }}
                      >
                        <BadgeIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Dialog open={open} onClose={handleCloseDialog}>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="id"
              label="ID"
              value={formData.id}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              margin="dense"
              name="position"
              label="Position"
              value={formData.position}
              onChange={handleInputChange}
              fullWidth
            />
            <FormControl fullWidth sx={{ marginTop: "8px" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Hire Date"
                  value={hireDate}
                  onChange={(newValue) => {
                    setHireDate(newValue);
                    setFormData({ ...formData, hireDate: newValue });
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </FormControl>
            <FormControl
              variant="standard"
              fullWidth
              sx={{ marginTop: "12px" }}
            >
              <InputLabel id="direct-reports-label">
                Direct Reports (Optional)
              </InputLabel>
              <Select
                labelId="direct-reports-label"
                multiple
                value={selectedDirectReports}
                onChange={(e) => setSelectedDirectReports(e.target.value)}
                renderValue={(selected) =>
                  allEmployees
                    .filter((employee) => selected.indexOf(employee.id) !== -1)
                    .map((employee) => employee.name)
                    .join(", ")
                }
                fullWidth
              >
                {allEmployees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} color="primary">
              Add
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={!!expandedEmployee}
          onClose={() => setExpandedEmployee(null)}
        >
          <DialogContent>
            {expandedEmployee && (
              <div>
                <h2>{expandedEmployee.employee.name}</h2>
                <p>Position: {expandedEmployee.employee.position}</p>
                <h3>Direct Hires:</h3>
                <ul>
                  {expandedEmployee.directHires.length === 0 &&
                    "No direct hires"}
                  {(expandedEmployee.directHires ?? []).map((hire) => (
                    <li key={hire}>{hire}</li>
                  ))}
                </ul>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Grid>
    </div>
  );
};

export default EmployeeTable;
