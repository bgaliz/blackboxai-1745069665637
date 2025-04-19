let courses = [];
let courseIdCounter = 1;
let moduleIdCounter = 1;
let videoIdCounter = 1;
let commentIdCounter = 1;

// Course structure:
// {
//   id,
//   teacherId,
//   title,
//   description,
//   modules: [
//     {
//       id,
//       title,
//       videos: [
//         {
//           id,
//           title,
//           videoUrl,
//           materials: [],
//           comments: [
//             {
//               id,
//               studentId,
//               message,
//               timestamp
//             }
//           ],
//           watchData: {
//             studentId: { watchTime: number }
//           }
//         }
//       ]
//     }
//   ]
// }

function addCourse(teacherId, title, description) {
  const course = {
    id: courseIdCounter++,
    teacherId,
    title,
    description,
    modules: [],
  };
  courses.push(course);
  return course;
}

function getCoursesByTeacher(teacherId) {
  return courses.filter(c => c.teacherId === teacherId);
}

function getCourseById(courseId) {
  return courses.find(c => c.id === courseId);
}

function addModule(courseId, title) {
  const course = getCourseById(courseId);
  if (!course) return null;
  const module = {
    id: moduleIdCounter++,
    title,
    videos: [],
  };
  course.modules.push(module);
  return module;
}

function addVideo(courseId, moduleId, title, videoUrl, materials) {
  const course = getCourseById(courseId);
  if (!course) return null;
  const module = course.modules.find(m => m.id === moduleId);
  if (!module) return null;
  const video = {
    id: videoIdCounter++,
    title,
    videoUrl,
    materials: materials || [],
    comments: [],
    watchData: {},
  };
  module.videos.push(video);
  return video;
}

function addComment(courseId, moduleId, videoId, studentId, message) {
  const course = getCourseById(courseId);
  if (!course) return null;
  const module = course.modules.find(m => m.id === moduleId);
  if (!module) return null;
  const video = module.videos.find(v => v.id === videoId);
  if (!video) return null;
  const comment = {
    id: commentIdCounter++,
    studentId,
    message,
    timestamp: new Date(),
  };
  video.comments.push(comment);
  return comment;
}

function addWatchTime(courseId, moduleId, videoId, studentId, watchTime) {
  const course = getCourseById(courseId);
  if (!course) return false;
  const module = course.modules.find(m => m.id === moduleId);
  if (!module) return false;
  const video = module.videos.find(v => v.id === videoId);
  if (!video) return false;
  if (!video.watchData[studentId]) {
    video.watchData[studentId] = 0;
  }
  video.watchData[studentId] += watchTime;
  return true;
}

module.exports = {
  addCourse,
  getCoursesByTeacher,
  getCourseById,
  addModule,
  addVideo,
  addComment,
  addWatchTime,
};
