drop database if exists employee_db;
create database employee_db;

use employee_db;

create table department (
    id int primary key not null auto_increment,
    department_name varchar(30) not null
);

create table role (
    id int primary key not null auto_increment,
    title varchar(30) not null,
    salary decimal,
    department_id int,
    foreign key (department_id) references department(id) on delete set null
);

create table employee (
    id int primary key not null auto_increment,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int,
    manager_id int,
    foreign key (role_id) references role(id) on delete set null,
    foreign key (manager_id) references employee(id) on delete set null
);