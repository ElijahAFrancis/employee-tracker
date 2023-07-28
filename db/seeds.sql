insert into department (department)
values ("Human Resources"),
       ("Quality Assurance"),
       ("Sales"),
       ("Accounting");

insert into role (title, salary, department_id)
values ("Human Resources Manager", 2000000, 1),
       ("Human Resources Lead", 1500000, 1),
       ("Human Resources Member", 1000000, 1),
       ("Quality Assurance Manager", 500000, 2),
       ("Quality Assurance Lead", 250000, 2),
       ("Quality Assurance Team Member", 50000, 2),
       ("Sales Manager", 10000000, 3),
       ("Sales Lead", 250000, 3),
       ("Sales Team Member", 25000, 3),
       ("Accounting Manager", 150000, 4),
       ("Accounting Lead", 75000, 4),
       ("Accounting Team Member", 50000, 4);

insert into employee (first_name, last_name, role_id, manager_id)