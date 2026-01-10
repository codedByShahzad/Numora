import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Droplets,
  Scale,
  Activity,
  Footprints,
  HeartPulse,
  Ruler,
  Weight,
  Thermometer,
  Gauge,
  Square,
  Box,
  DollarSign,
  Percent,
  PiggyBank,
  Landmark,
  CreditCard,
  TrendingUp,
  FunctionSquare,
  Shapes,
  BarChart,
  Clock,
  Calendar,
  Globe,
  BookOpen,
  CalendarDays,
  BarChart3,
} from "lucide-react";

export type CalculatorItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  id: string;
};

export const calculatorsData: Record<string, CalculatorItem[]> = {
  health: [
    { title: "BMI Calculator", description: "Calculate your Body Mass Index.", icon: Heart, id: "bmi" },
    { title: "Water Intake Calculator", description: "Find out how much water you should drink daily.", icon: Droplets, id: "water-intake" },
    { title: "Calorie Calculator", description: "Estimate your daily calorie needs.", icon: Scale, id: "calorie" },
    { title: "Body Fat Calculator", description: "Estimate your body fat percentage.", icon: Activity, id: "body-fat" },
    { title: "Steps to Calories Calculator", description: "Find out how many calories you burn.", icon: Footprints, id: "steps-to-calories" },
    { title: "Heart Rate Calculator", description: "Calculate your maximum heart rate.", icon: HeartPulse, id: "heart-rate" },
  ],
  "unit-conversions": [
    { title: "Length Converter", description: "Convert between meters, kilometers, miles, feet, and more.", icon: Ruler, id: "length" },
    { title: "Weight Converter", description: "Convert between kilograms, pounds, grams, ounces, and more.", icon: Weight, id: "weight" },
    { title: "Temperature Converter", description: "Convert between Celsius, Fahrenheit, and Kelvin.", icon: Thermometer, id: "temperature" },
    { title: "Speed Converter", description: "Convert between km/h, mph, m/s, and knots.", icon: Gauge, id: "speed" },
    { title: "Area Converter", description: "Convert between square meters, acres, hectares, and more.", icon: Square, id: "area" },
    { title: "Volume Converter", description: "Convert between liters, milliliters, gallons, and more.", icon: Box, id: "volume" },
  ],
  finance: [
    { title: "Simple Interest Calculator", description: "Calculate interest earned or paid on a principal amount.", icon: Percent, id: "simple-interest" },
    { title: "Compound Interest Calculator", description: "Find out how your money grows with compounding interest.", icon: PiggyBank, id: "compound-interest" },
    { title: "Loan EMI Calculator", description: "Estimate monthly payments for loans.", icon: CreditCard, id: "loan-emi" },
    { title: "Mortgage Calculator", description: "Calculate monthly mortgage payments.", icon: Landmark, id: "mortgage" },
    { title: "Investment Return Calculator", description: "Estimate future value of investments.", icon: TrendingUp, id: "investment-return" },
    { title: "Currency Converter", description: "Convert between currencies using exchange rates.", icon: DollarSign, id: "currency-converter" },

    // ✅ your new calculator card
    { title: "Statistics Calculator", description: "Mean, median, mode, variance & standard deviation.", icon: BarChart3, id: "statistics" },
  ],
  "maths-science": [
    { title: "Scientific Calculator", description: "Perform advanced math operations.", icon: FunctionSquare, id: "scientific" },
    { title: "Physics Calculator", description: "Solve physics problems like motion, force, energy.", icon: Gauge, id: "physics" },
    { title: "Chemistry Calculator", description: "Compute molar mass, solution concentration, etc.", icon: Activity, id: "chemistry" },
    { title: "Algebra Calculator", description: "Solve equations, inequalities, and simplify expressions.", icon: FunctionSquare, id: "algebra" },
    { title: "Geometry Calculator", description: "Calculate area, perimeter, and volume of shapes.", icon: Shapes, id: "geometry" },
    { title: "Statistics Calculator", description: "Compute mean, median, mode, and standard deviation.", icon: BarChart, id: "statistics" },
  ],
  "everyday-life": [
    { title: "Tip Calculator", description: "Calculate tips and split bills easily.", icon: Clock, id: "tip" },
    { title: "Age Calculator", description: "Find out your age in years, months, and days.", icon: Calendar, id: "age" },
    { title: "Time Zone Converter", description: "Convert time between different time zones.", icon: Globe, id: "time-zone" },
    { title: "Discount Calculator", description: "Calculate discounts and final prices.", icon: Percent, id: "discount" },
    { title: "GPA Calculator", description: "Calculate your Grade Point Average for school or college.", icon: BookOpen, id: "gpa" },
    { title: "Day Calculator", description: "Find the number of days between two dates.", icon: CalendarDays, id: "day-calculator" },
  ],
};
