// Sample Data
const CourseInfo = { id: 1, name: "JavaScript Fundamentals" };

const AssignmentGroup = {
  id: 1,
  name: "Midterm Assignments",
  course_id: 1,
  group_weight: 30,
  assignments: [
    { id: 1, name: "Assignment 1", due_at: "2025-01-30T12:00:00Z", points_possible: 100 },
    { id: 2, name: "Assignment 2", due_at: "2025-02-01T12:00:00Z", points_possible: 200 },
  ]
};

const LearnerSubmissions = [
  { learner_id: 101, assignment_id: 1, submission: { submitted_at: "2025-01-29T12:00:00Z", score: 80 } },
  { learner_id: 101, assignment_id: 2, submission: { submitted_at: "2025-02-01T13:00:00Z", score: 170 } }, // Late submission
  { learner_id: 102, assignment_id: 1, submission: { submitted_at: "2025-01-29T11:00:00Z", score: 90 } },
  { learner_id: 102, assignment_id: 2, submission: { submitted_at: "2025-02-01T11:00:00Z", score: 190 } },
];

// Function to calculate the learner's average
function calculateWeightedAverage(assignmentScores, groupWeight, totalPoints) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const assignmentId in assignmentScores) {
    if (assignmentScores[assignmentId] !== null) {
      weightedSum += assignmentScores[assignmentId] * groupWeight;
      totalWeight += groupWeight;
    }
  }

  return (weightedSum / totalPoints) * 100;
}

// Function to handle errors and validate data
function validateData(courseInfo, assignmentGroup) {
  if (assignmentGroup.course_id !== courseInfo.id) {
    throw new Error("Assignment group is not associated with the correct course.");
  }
  assignmentGroup.assignments.forEach(assignment => {
    if (typeof assignment.points_possible !== 'number' || assignment.points_possible <= 0) {
      throw new Error(`Invalid points_possible for assignment: ${assignment.name}`);
    }
  });
}

// Function to get learner data
function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
  try {
    validateData(courseInfo, assignmentGroup);
    
    let result = [];

    // Process each learner's submissions
    learnerSubmissions.forEach(submission => {
      const learnerId = submission.learner_id;
      const assignmentId = submission.assignment_id;
      const assignment = assignmentGroup.assignments.find(a => a.id === assignmentId);
      
      // Skip if assignment is not due yet
      const dueDate = new Date(assignment.due_at);
      const submittedAt = new Date(submission.submission.submitted_at);
      if (dueDate > Date.now()) return;

      // Deduct points for late submissions
      let score = submission.submission.score;
      if (submittedAt > dueDate) {
        score *= 0.9; // 10% penalty for late submission
      }

      // Store score for the learner and assignment
      if (!result[learnerId]) {
        result[learnerId] = {
          id: learnerId,
          avg: 0,
          assignments: {}
        };
      }

      const percentage = (score / assignment.points_possible) * 100;
      result[learnerId].assignments[assignmentId] = percentage;
    });

    // Calculate weighted average for each learner
    for (const learnerId in result) {
      const learner = result[learnerId];
      let totalPoints = 0;
      for (const assignmentId in learner.assignments) {
        const assignment = assignmentGroup.assignments.find(a => a.id === assignmentId);
        totalPoints += assignment.points_possible;
      }
      learner.avg = calculateWeightedAverage(learner.assignments, assignmentGroup.group_weight, totalPoints);
    }

    return Object.values(result);
  } catch (error) {
    console.error("Error", error.message);
  }
}

// Get learner data and log it
const learnerData = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);
console.log(learnerData);
