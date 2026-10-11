---
title: "Product Brief: Flex PT"
status: final
created: 2026-09-17
updated: 2026-10-11
---

# Product Brief: Flex PT

*A personal trainer that adapts to everyday life*

## Executive Summary

Flex PT is a web-based training service that uses artificial intelligence (AI) to provide personalized coaching in strength training and running to fitness-minded people with busy and unpredictable schedules. The solution combines an individual training plan, logging of completed sessions, and a conversational digital coach. The goal is to make it easier to train regularly and make progress, without the user having to coordinate several tools or start over whenever a week does not go as planned.

Many training programs feel too static. Different apps tend to cover separate needs, and the user has to adapt the plan themselves when travel, social activities, or fluctuating energy levels get in the way. Flex PT is therefore designed to adapt the training to the user's life, rather than requiring the user's life to adapt to the training program. The user describes their training goal, experience, and available time, and receives a plan generated from a predefined rule set, which is then adjusted through dialogue and actual execution.

## The Problem

The problem particularly affects people who want to train regularly but struggle to make a fixed program work in practice. They may have clear goals — running a half marathon, getting stronger, or achieving their first pull-up — while their time and capacity vary from week to week. A program built around four fixed sessions becomes impractical if the user only manages to fit in two.

Today's alternatives tend to be specialized training apps, standardized training programs, activity trackers, and personal trainers. To cover the full need, users often have to combine several solutions and ensure the advice is coherent themselves. Running and strength training are typically planned in different apps, while sessions have to be entered into the calendar manually. This can be time-consuming, produce a fragmented user experience, and require multiple subscriptions.

When the plan does not account for changes in everyday life, the user has to reorganize sessions themselves or discard the program and start over. The result can be reduced continuity, weaker motivation, and unnecessary guilt over sessions that were not completed. The challenge, therefore, is not only building a good training program, but keeping the program relevant as the user's circumstances change.

## The Solution

We will develop a web service that functions as a digital personal trainer for strength training and running. When users register, they create a profile with information about their training goal, experience, desired training volume, and available days. Each user has exactly one active training goal at a time. The profile gives the solution enough context to suggest a realistic and achievable plan.

The training plan is generated from a predefined rule set implemented in the application, not freely by the language model. The rule set determines, for example, the maximum number of sessions per week, rest days after demanding sessions, and how much load or distance may increase from one week to the next. This makes it possible to verify that every plan, and every change to it, is realistic and safe.

The user receives a consolidated training plan and can log which sessions were actually completed. The digital coach uses this information to suggest further progression and necessary adjustments. A missed session should not automatically mean the user feels they have to start over. Instead, the solution should help the user prioritize what is still possible and show how the updated plan still supports the overall goal.

Dialogue with the digital coach is a central part of the solution. For example, the user should be able to say that a trip will limit training opportunities in the coming week, or that their energy level calls for an adjustment. The conversation must have a visible consequence in the training program, not merely result in general advice alongside the plan. All changes the coach proposes are validated against the rule set before they are applied. If the user only has time for two strength sessions, the coach might, for example, suggest two full-body sessions rather than a plan that assumes several separate sessions.

Relevant information should be remembered across conversations and tied to the correct user, so that the coaching feels personal and consistent over time.

The intended effect is less administration, easier replanning, and a more cohesive training experience. Users should spend less time organizing their training and more time actually doing it.

## What Makes This Different

What sets Flex PT apart from current alternatives is the combination of flexible planning, a coach that knows the user's context, and support for both strength training and running within one coherent plan. The value lies not in the chatbot alone, but in the connection between the conversation, the training history, and the current training plan.

Existing alternatives each cover part of the need:

- **ChatGPT** can create customized training programs, but it is difficult to update the training plan in a simple way through the chat, and the plan is not stored as a structured program that follows the user's actual training.
- **Strong Workout Tracker** is well suited for logging strength sessions, but it lacks progression suggestions and can only be used for strength training.
- **Garmin Connect** is good at logging sessions, but it does not provide concrete suggestions for progression or new strength exercises.
- **90-days** suggests new exercises and progression through a tailored program, but the user is locked to a set number of exercises or a default session length.

Flex PT combines what these alternatives offer separately: a structured plan for both strength and running, progression based on logged sessions, and a coach that can change the plan directly when the user's week changes. Because the plan is generated and validated by a predefined rule set, changes made through conversation remain consistent and traceable, unlike a plan that only exists as text in a general-purpose chat.

The solution is not intended to replace the professional and human follow-up a physical personal trainer can offer in every situation. It is primarily meant to be an accessible option for users who want structure and personal adaptation but prefer to organize and carry out their training on their own.

## Who This Serves

The primary user is a fitness-minded person with a busy or shifting daily schedule who wants progress and structure in strength training and/or running without being tied to a rigid weekly program. The user is comfortable with digital services and willing to log sessions and give brief feedback. Needs and usage patterns matter more than age.

A typical user combines work or studies with social activities and training. They roughly know what they want to achieve but need help translating that ambition into realistic sessions. The need is both practical and motivational: what should be prioritized this week, and how can training continue when the original plan cannot be carried out?

Success, from the user's perspective, means it is easy to find the next relevant session, complete it, and adjust the rest of the week as needed. A week with less training than planned should still feel meaningful. Beginners may also benefit from the solution, but initial testing should focus on users who can articulate a concrete training goal. People who require medical evaluation or specialized health-related follow-up are not the primary target group for the first version.

## Success Criteria

The functional minimum is that the user can create an account, receive a goal-adapted training program, log a completed session, and receive an updated suggestion. In addition, the chatbot must function as a personal trainer and retain relevant user context over time.

The solution will be validated through a user test based on four predefined test profiles, each with its own training goal, for example:

| Test profile | Training goal | Training type |
| --- | --- | --- |
| 1 | Run a first 5 km | Running |
| 2 | Complete a half marathon | Running |
| 3 | Get started on my fitness journey | Strength |
| 4 | Achieve a first pull-up | Strength |

The profiles differ in experience level and available days, so that the rule set is tested with different training volumes. Each profile has a documented expected training plan that generated plans can be compared against.

| Signal | Measurement or evidence | Proposed target | When measured |
| --- | --- | --- | --- |
| Plan quality | The generated plan for each test profile follows the rule set and matches the expected plan. | All four profiles. | Before the user test and after changes to the rule set |
| User outcome | Test participant logs in with a test profile, receives a plan, logs a session, and adapts the plan to a changed week without help. | Completed for all four profiles. | User test |
| Coach adaptation | Given a fixed scenario (e.g. "I am away Thursday–Sunday"), the coach proposes a plan change that has a visible effect and passes rule validation. | Correct change for all four profiles. | User test |
| Quality and trust | Agreed tests of stored context, separated user data, and program changes are carried out. | All critical tests pass. | Before the user test and after significant changes |

A small user test can give indications of usability but cannot document long-term usage or health outcomes.

## Scope

### In scope for the first version

The first version will be a web-based minimum viable product (MVP) that tests the full user journey from creating a profile to receiving an updated training plan. The first version supports strength training and running, and each user has one active training goal. Five core capabilities are prioritized:

1. **Account and persistent profile:** The user can log in and store their training goal, experience, and availability. This information must persist for the correct user between visits.
2. **Personal training plan:** The user receives a realistic, achievable training plan generated from a predefined rule set based on the information in their profile.
3. **Manual session logging:** The user can log completed training and relevant feedback, so the plan is built on actual activity.
4. **Coach dialogue and adaptation:** The user can communicate changed time constraints and energy levels, and the digital coach can propose concrete changes to the plan that are validated against the rule set.
5. **Follow-up and progression:** The service suggests further progression based on completed sessions and current circumstances, following the rule set, and shows the updated plan clearly.

Safe handling of personal data is a fundamental requirement. Before testing, the team must clarify which data is necessary, how it will be protected, and what data, if any, is shared with external services.

### Out of scope for the first version

The course feedback confirmed that the integrations and features below should be kept out of the first version.

Training types other than strength training and running, as well as multiple simultaneous training goals per user, are not part of the first version.

Registration of available equipment and a selectable coaching style (for example supportive or more direct) are not part of the first version. The plan assumes a standard set of exercises, and the coach uses one consistent tone.

Automatic import of training sessions from third-party services such as Strava, Apple Health, and Garmin Connect is of interest to explore, but is not required for the first version to function.

Calendar integration, including importing appointments and exporting training sessions, is also a desired feature. In the first version, it is sufficient for the user to state availability manually, so that the core value can be tested without external integrations.

Later versions may also include specialized training programs related to the menstrual cycle and pregnancy, as well as features for nutrition tracking and planning. Such features require dedicated assessment of professional quality, safety, and handling of health data.

Game mechanics, reward systems, and subscription management may be considered at a later stage, but are not required to demonstrate the core value of the product.

## Vision

Over a two-to-three-year horizon, the vision is to develop Flex PT into a unified digital training partner that receives information about completed sessions directly from third-party apps such as Strava, Apple Health, and Garmin Connect. This would remove the need for manual activity logging, and the training plan could update based on what was actually completed.

The solution should also be able to use calendar information to suggest which days and times are best suited for training, and which types of sessions make sense on a given day. Planned training sessions should be able to be added directly to the user's calendar.

Later versions could support more training types, adapt the plan to the user's available equipment, and let the user choose the coach's communication style. In the longer term, the solution could also offer concrete nutrition advice based on the user's goals, training load, and daily life. Further development should be guided by the needs test users actually experience, documented value, and practical feasibility.

The overarching vision is a personal training partner that knows the user's goals, tracks progress over time, and makes it easier to balance training with the rest of life.
