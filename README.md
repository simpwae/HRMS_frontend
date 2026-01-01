# University HR Management System - Class Diagram

## Overview

This project contains comprehensive UML class diagrams for a University Human Resources Management System. The diagrams illustrate the relationships between different types of employees, HR personnel, and supporting classes in a university setting.

## Files Included

- `university-hr-class-diagram.mmd` - Main Mermaid class diagram
- `README.md` - This documentation file

## Extensions Installed

- **Mermaid Chart** (`mermaidchart.vscode-mermaid-chart`) - Official Mermaid editor with AI-powered diagramming
- **Draw.io Integration** (`hediet.vscode-drawio`) - For creating alternative UML diagrams

## Class Hierarchy

### Main Classes

#### 1. Person (Abstract Base Class)

- Base class for all individuals in the system
- Contains common personal information and contact details

#### 2. Employee (Inherits from Person)

- Base class for all university employees
- Contains employment-related information like hire date, salary, position

#### 3. Academic Staff (Inherits from Employee)

- Faculty members responsible for teaching and research
- Specializations include:
  - **Professor**: Senior faculty with tenure, research grants, PhD supervision
  - **Associate Professor**: Mid-level faculty with committee responsibilities
  - **Assistant Professor**: Junior faculty on tenure track
  - **Lecturer**: Teaching-focused faculty with course delivery responsibilities

#### 4. Administrative Staff (Inherits from Employee)

- Non-academic employees handling university operations
- Includes various administrative roles and responsibilities

#### 5. HR Personnel (Inherits from Employee)

- Human Resources staff managing employee-related functions
- Specializations include:
  - **HR Manager**: Oversees HR operations and policy
  - **Recruitment Specialist**: Handles hiring and candidate screening
  - **Payroll Specialist**: Manages salary processing and benefits

### Supporting Classes

#### HR Department

- Central unit managing all HR operations
- Contains HR personnel and manages employee relations

#### University

- Top-level entity containing all departments and employees
- Manages university-wide operations

#### Department

- Academic or administrative units within the university
- Employs various types of staff

#### Records and Management

- **LeaveRecord**: Tracks employee leave requests and approvals
- **PayrollRecord**: Manages salary calculations and pay slips
- **PerformanceReview**: Handles employee evaluations and goal setting
- **Contract**: Manages employment contracts and terms
- **TrainingProgram**: Coordinates employee development and training

## Key Relationships

### Inheritance Relationships

- Person → Employee → (AcademicStaff, AdministrativeStaff, HRPersonnel)
- AcademicStaff → (Professor, AssociateProfessor, AssistantProfessor, Lecturer)
- HRPersonnel → (HRManager, RecruitmentSpecialist, PayrollSpecialist)

### Composition and Aggregation

- University _contains_ HRDepartment (composition)
- University _contains_ Departments (composition)
- HRDepartment _manages_ HRPersonnel (composition)
- Department _employs_ Employees (aggregation)

### Key Associations

- Employee (1) → LeaveRecord (0..\*)
- Employee (1) → PayrollRecord (0..\*)
- Employee (1) → PerformanceReview (0..\*)
- Employee (1) → Contract (1)
- Employee (0.._) → TrainingProgram (0.._) - Many-to-Many
- Professor (1) → AssistantProfessor (0..\*) - Mentoring relationship

## Design Principles Applied

1. **Inheritance**: Clear hierarchy from Person to specific employee types
2. **Composition**: Strong ownership relationships (University owns departments)
3. **Aggregation**: Weaker associations (Departments employ staff)
4. **Encapsulation**: Private attributes with public methods
5. **Polymorphism**: Common interface through base Employee class

## Usage Instructions

### Viewing the Diagram

1. Open `university-hr-class-diagram.mmd` in VS Code
2. Use the Mermaid Chart extension to preview the diagram
3. The diagram will render showing all classes and relationships

### Creating Alternative Diagrams

1. Use Draw.io Integration to create additional UML diagrams
2. Right-click in explorer → New File → Create `.drawio` file
3. Use the built-in UML shapes to recreate or modify the design

### Customizing the Diagram

1. Modify the `.mmd` file to add/remove classes or relationships
2. Use Mermaid syntax for class diagrams
3. Validate syntax using the built-in validator

## Future Enhancements

- Add sequence diagrams for HR processes
- Create state diagrams for employee lifecycle
- Add database schema diagrams
- Include activity diagrams for recruitment workflow

## Notes

- All employees must have contracts and performance reviews
- The system supports multiple types of academic and administrative roles
- HR department centralizes all employee management functions
- Training programs support employee development across all categories
