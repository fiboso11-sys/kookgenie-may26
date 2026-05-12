export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  caloriesEst: number;
};

export type WorkoutProgram = {
  id: string;
  title: string;
  category: "Beginner" | "Fat loss" | "Muscle gain" | "Yoga";
  description: string;
  durationMin: number;
  exercises: Exercise[];
};

export const workouts: WorkoutProgram[] = [
  {
    id: "starter-full-body",
    title: "Starter Full Body",
    category: "Beginner",
    description: "Foundational movement patterns with manageable volume.",
    durationMin: 28,
    exercises: [
      { name: "Bodyweight squats", sets: 3, reps: "12–15", caloriesEst: 45 },
      { name: "Incline push-ups", sets: 3, reps: "8–12", caloriesEst: 40 },
      { name: "Glute bridge", sets: 3, reps: "15", caloriesEst: 25 },
      { name: "Dead bug", sets: 3, reps: "10 each side", caloriesEst: 20 },
    ],
  },
  {
    id: "fat-loss-circuit",
    title: "Metabolic Fat-Loss Circuit",
    category: "Fat loss",
    description: "Short rest intervals to elevate heart rate and burn calories.",
    durationMin: 32,
    exercises: [
      { name: "Jump rope or high knees", sets: 4, reps: "45 sec", caloriesEst: 120 },
      { name: "Kettlebell swings", sets: 4, reps: "15", caloriesEst: 100 },
      { name: "Walking lunges", sets: 3, reps: "12 each leg", caloriesEst: 80 },
      { name: "Mountain climbers", sets: 3, reps: "30 sec", caloriesEst: 70 },
    ],
  },
  {
    id: "upper-hypertrophy",
    title: "Upper Body Hypertrophy",
    category: "Muscle gain",
    description: "Moderate reps with focus on time under tension.",
    durationMin: 45,
    exercises: [
      { name: "Bench press or push-ups", sets: 4, reps: "8–10", caloriesEst: 90 },
      { name: "Dumbbell rows", sets: 4, reps: "10 each", caloriesEst: 85 },
      { name: "Overhead press", sets: 3, reps: "8–10", caloriesEst: 55 },
      { name: "Face pulls / band pull-aparts", sets: 3, reps: "15", caloriesEst: 30 },
    ],
  },
  {
    id: "morning-yoga-flow",
    title: "Morning Mobility Flow",
    category: "Yoga",
    description: "Gentle flow to open hips, spine, and shoulders.",
    durationMin: 24,
    exercises: [
      { name: "Cat-cow", sets: 2, reps: "10 breaths", caloriesEst: 15 },
      { name: "Sun salutation A", sets: 3, reps: "5 rounds", caloriesEst: 60 },
      { name: "Warrior II sequence", sets: 2, reps: "60 sec each side", caloriesEst: 40 },
      { name: "Savasana", sets: 1, reps: "5 min", caloriesEst: 10 },
    ],
  },
];

export function getWorkoutById(id: string) {
  return workouts.find((w) => w.id === id);
}
