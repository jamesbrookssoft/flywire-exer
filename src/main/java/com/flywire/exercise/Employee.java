package com.flywire.exercise;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Employee {
  private boolean active;
  private List<Integer> directReports;
  private String hireDate;
  private int id;
  private String name;
  private String position;

  @JsonProperty("active")
  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  @JsonProperty("directReports")
  public List<Integer> getDirectReports() {
    return directReports;
  }

  public void setDirectReports(List<Integer> directReports) {
    this.directReports = directReports;
  }

  @JsonProperty("hireDate")
  public String getHireDate() {
    return hireDate;
  }

  public void setHireDate(String hireDate) {
    this.hireDate = hireDate;
  }

  @JsonProperty("id")
  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }

  @JsonProperty("name")
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  @JsonProperty("position")
  public String getPosition() {
    return position;
  }

  public void setPosition(String position) {
    this.position = position;
  }

  // Getters and setters for other fields, if needed
}
