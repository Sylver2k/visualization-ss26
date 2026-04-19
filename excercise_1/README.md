# Exercise 1: Perceived Area Experiment

This project is a Nuxt-based web application for Exercise 1 of Visualization SS26. It supports an experiment that measures how people perceive the size of geometric shapes and helps estimate the perception exponent `x` for different participants.

## Task Context

In data visualization, shapes such as circles and squares are often used to represent numeric values. The assignment is based on the observation that the perceived size of a shape is not always proportional to its actual area.

For circles, the following relationship is assumed:

```text
perceived size ratio = (actual area ratio)^x
```

The value of `x` can vary slightly from person to person. The goal of this exercise is to design and implement a program that can measure `x` for test participants.

The assignment requires:

- developing a strategy to measure `x`
- implementing the program for circles and squares
- running a measurement series with one or more participants
- visualizing the resulting measurements in a suitable way

## Project Overview

The application presents an interactive perceived-area study. Participants compare shapes and adjust them until they believe a target size relationship has been matched. The collected responses can then be used to estimate the personal perception exponent `x` for each participant and compare results across shape types.

## Tech Stack

- Nuxt 4 (Vue.js framework)
- Vuetify

## Prerequisites

Before running the application, make sure Node.js is installed on your machine.

## Installation

Clone the repository and move into the project folder:

```bash
git clone https://github.com/Sylver2k/visualization-ss26.git
cd visualization-ss26/excercise_1
```

Install the project dependencies from the repository root:

```bash
npm install
```

## Running The Application

Start the development server:

```bash
npm run dev
```

The app will then be available at `http://localhost:3000`.

## Build And Preview

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```
