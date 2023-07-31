const inquirer = require('inquirer');
const db = require('./db/db');

db.connect(err => {
    if (err) {
        console.error(err)
    } else {
        console.log('Database connected.');
        start();
    }
});

function start() {
    inquirer.prompt([{
        type: 'list',
        name: 'prompt',
        message: 'What would you like to do?',
        choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role', 'Quit']
    }]).then((selection) => {
        if (selection.prompt === 'View Departments') {
            db.query(`select * from department`, (err, result) => {
                if (err) {
                    console.error(err)
                } else {
                    console.table(result);
                    start();
                }
            });
        } else if (selection.prompt === 'View Roles') {
            db.query(`select * from role`, (err, result) => {
                if (err) {
                    console.error(err)
                } else {
                    console.table(result);
                    start();
                }
            });
        } else if (selection.prompt === 'View Employees') {
            db.query(`select * from employee`, (err, result) => {
                if (err) {
                    console.error(err)
                } else {
                    console.table(result);
                    start();
                }
            });
        } else if (selection.prompt === 'Add Department') {
            inquirer.prompt([{
                type: 'input',
                name: 'department',
                message: 'What will the new department be?',
                validate: input => {
                    if (input) {
                        return true;
                    } else {
                        console.log('Department needs a name');
                        return false;
                    }
                }
            }]).then((responses) => {
                db.query(`insert into department (department_name) VALUES (?)`, [responses.department], (err, result) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log(`${responses.department} added to employee database.`)
                        start();
                    }
                });
            })
        } else if (selection.prompt === 'Add Role') {
            var roleDepartment
            var departmentArr = []
            db.query(`select * from department`, (err, departments) => {
                    if (err) {
                        console.error(err)
                    } else {
                        for(i=0; i<departments.length; i++) {
                            departmentArr.push(departments[i].department_name);
                        }

                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'role',
                            message: 'What will the new role be?',
                            validate: input => {
                                if (input) {
                                    return true;
                                } else {
                                    console.log('New role needs a name');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'input',
                            name: 'salary',
                            message: 'What will the new roles salary be?',
                            validate: input => {
                                if (input) {
                                    return true;
                                } else {
                                    console.log('New role needs a salary');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'list',
                            name: 'department',
                            message: 'What department will the new role be a part of?',
                            choices: departmentArr
                        }
                    ]).then((responses) => {
                        for (var i = 0; i < departments.length; i++) {
                            if (departments[i].department_name === responses.department) {
                                roleDepartment = departments[i];
                            }
                        }
                        db.query(`insert into role (title, salary, department_id) values (?, ?, ?)`, [responses.role, responses.salary, roleDepartment.id], (err, result) => {
                            if (err) {
                                console.error(err)
                            } else {
                                console.log(`Added ${responses.role} to the database.`)
                                start();
                            }
                        });
                    })
                }
            });
        } else if (selection.prompt === 'Add Employee') {
            db.query(`select * from role`, (err, roles) => {
                if (err) {
                    console.error(err)
                } else {
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'firstName',
                            message: 'What is the new employees first name?',
                            validate: firstNameInput => {
                                if (firstNameInput) {
                                    return true;
                                } else {
                                    console.log('Employee needs a first name');
                                return false;
                                }
                            }
                        },
                        {
                            type: 'input',
                            name: 'lastName',
                            message: 'What is the employees last name?',
                            validate: lastNameInput => {
                                if (lastNameInput) {
                                    return true;
                                } else {
                                    console.log('Employee needs a last name');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: 'What is the employees role?',
                            choices: () => {
                                var roleArr = [];
                                for (var i = 0; i < roles.length; i++) {
                                    roleArr.push(roles[i].title);
                                }
                                return roleArr
                            }
                        },
                        {
                            type: 'input',
                            name: 'manager',
                            message: 'Who is the employees manager?'
                    }
                    ]).then((responses) => {
                        db.query(`select * from employee`, (err, employees) => {
                            for (var i = 0; i < roles.length; i++) {
                                if (roles[i].title === responses.role) {
                                var role = roles[i];
                                }
                            }
                            for (var i = 0; i < employees.length; i++) {
                                if(employees[i].first_name === responses.manager) {
                                    var managerId = employees[i].id
                                }
                            }
                            if (!managerId) {
                                console.log('New employee has no manager')
                            }
                            db.query(`insert into employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [responses.firstName, responses.lastName, role.id, managerId], (err, result) => {
                            if (err) {
                                console.error(err)
                            } else {
                                console.log(`Added ${responses.firstName} ${responses.lastName} to the database.`)
                                start();
                            }
                        })
                    });
                })
                }
            });
        } else if (selection.prompt === 'Update Employee Role') {
            db.query(`select * from employee, role`, (err, results) => {
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: 'Who do you want to update?',
                        choices: () => {
                            var employeeArr = [];
                            for (var i = 0; i < results.length; i++) {
                                employeeArr.push(results[i].last_name);
                            }
                            var newEmployeeArray = [...new Set(employeeArr)];
                            return newEmployeeArray;
                        }
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What will their new role be?',
                        choices: () => {
                        var roleArr = [];
                            for (var i = 0; i < results.length; i++) {
                                roleArr.push(results[i].title);
                            }                                var newRoleArray = [...new Set(roleArr)];
                               return newRoleArray;
                        }
                    }
                ]).then((responses) => {
                    db.query(`select * from role`, (err, roles) => {
                        var roleId
                        var employeeId
                        for (var i = 0; i < roles.length; i++) {
                            if (roles[i].title === responses.role) {
                            roleId = roles[i].id;
                            }
                        }
                        db.query(`select * from employee`, (err, employees) => {

                            for (var i = 0; i < employees.length; i++) {
                                if (employees[i].last_name === responses.employee) {
                                    employeeId = employees[i].id;
                                }
                            }
                            db.query(`update employee set role_id = ? where id = ?`, [roleId, employeeId], (err, result) => {
                                if (err) {
                                    console.error(err)
                                } else {
                                    console.log(`${responses.employee} role updated`)
                                    start();
                                }
                            });
                        })
                    })
                })
            });
        } else if (selection.prompt === 'Quit') {
            db.end();
            console.log("Thank you!");
        }
    })
};