# Exercise 2: Pre-attentive Perception Experiment

This project is a Nuxt-based web application for Exercise 2 of Visualization SS26. It supports an experiment that tests whether visual object properties can be perceived pre-attentively and helps compare recognition performance across different stimulus conditions.

## Task Context

Pre-attentive perception describes the recognition of visual properties without focused attention and before conscious, sequential search is required. Such features can often be processed in parallel within a fraction of a second.

The goal of this exercise is to design and implement an application that can test whether object properties such as color, shape, size, or orientation are perceived pre-attentively. The experiment should also support qualitative and quantitative comparisons between properties.

The assignment requires:

- designing a program that tests different visual properties for pre-attentive perception
- measuring how quickly the different properties can be recognized
- investigating how recognition depends on the diversity of the distractors
- demonstrating that conjunction search is not pre-attentive by comparing it with single-feature search

## Project Overview

The application presents a configurable visual-search experiment. Participants briefly see two stimulus fields and then choose whether the target appeared in the left or right field. Each run can be configured by feature type, stimulus display time, number of elements, distractor diversity, and whether the target is defined by a single feature or by a conjunction of features.

After the configured trials are completed, the application shows the recognition accuracy, number of trials, stimulus duration, and a trial-by-trial result table.

## Tech Stack

- Nuxt 4 (Vue.js framework)
- Vuetify

## Prerequisites

Before running the application, make sure Node.js is installed on your machine.

## Installation

Clone the repository and move into the project folder:

```bash
git clone https://github.com/Sylver2k/visualization-ss26.git
cd visualization-ss26/excercise_2
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
