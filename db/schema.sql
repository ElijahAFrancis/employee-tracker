drop database if exists employee_db;
create database employee_db;

use employee_db;

create table department (
    id int primary key not null auto_increment,
    name varchar(30) not null,
);

create table role (
    id int primary key not null,
    title varchar(30) not null,
    salary decimal,
    foreign key (department_id) references department(id) on delete set null,
);

create table employee (
    id int primary key not null,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    foreign key (role_id) references role(id) on delete set null,
    manager_id int,
);