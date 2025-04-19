const bcrypt = require('bcryptjs');

const users = [
  // Sample users
  {
    id: 1,
    username: 'teacher1',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'teacher',
  },
  {
    id: 2,
    username: 'student1',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'student',
  },
];

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

function findUserById(id) {
  return users.find(u => u.id === id);
}

function addUser(username, password, role) {
  const id = users.length + 1;
  const passwordHash = bcrypt.hashSync(password, 8);
  const user = { id, username, passwordHash, role };
  users.push(user);
  return user;
}

module.exports = {
  users,
  findUserByUsername,
  findUserById,
  addUser,
};
