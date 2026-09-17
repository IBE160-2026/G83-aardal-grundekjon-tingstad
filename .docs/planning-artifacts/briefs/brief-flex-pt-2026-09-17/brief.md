---
title: "Product Brief: Flex PT"
status: final
created: 2026-09-17
updated: 2026-09-17
---

# Product Brief: Flex PT

*A personal trainer that adapts to everyday life*

## Executive Summary

Flex PT is a web-based training service that uses artificial intelligence (AI) to provide personalized coaching to fitness-minded people with busy and unpredictable schedules. The solution combines an individual training plan, logging of completed sessions, and a conversational digital coach. The goal is to make it easier to train regularly and make progress, without the user having to coordinate several tools or start over whenever a week does not go as planned.

Many training programs feel too static. Different apps tend to cover separate needs, and the user has to adapt the plan themselves when travel, social activities, or fluctuating energy levels get in the way. Flex PT is therefore designed to adapt the training to the user's life, rather than requiring the user's life to adapt to the training program. The user describes their goals, experience, available time, and equipment, and receives a plan that is adjusted through dialogue and actual execution.

## The Problem

The problem particularly affects people who want to train regularly but struggle to make a fixed program work in practice. They may have clear goals — running a half marathon, getting stronger, or achieving their first pull-up — while their time and capacity vary from week to week. A program built around four fixed sessions becomes impractical if the user only manages to fit in two.

Today's alternatives tend to be specialized training apps, standardized training programs, activity trackers, and personal trainers. To cover the full need, users often have to combine several solutions and ensure the advice is coherent themselves. Running and strength training are typically planned in different apps, while sessions have to be entered into the calendar manually. This can be time-consuming, produce a fragmented user experience, and require multiple subscriptions.

When the plan does not account for changes in everyday life, the user has to reorganize sessions themselves or discard the program and start over. The result can be reduced continuity, weaker motivation, and unnecessary guilt over sessions that were not completed. The challenge, therefore, is not only building a good training program, but keeping the program relevant as the user's circumstances change.

## The Solution

We will develop a web service that functions as a digital personal trainer. When users register, they create a profile with information about training goals, experience, desired training volume, available days, and relevant equipment. The profile gives the solution enough context to suggest a realistic and achievable plan, whether the user trains at home, at a gym, or outdoors.

The user receives a consolidated training plan and can log which sessions were actually completed. The digital coach uses this information to suggest further progression and necessary adjustments. A missed session should not automatically mean the user feels they have to start over. Instead, the solution should help the user prioritize what is still possible and show how the updated plan still supports the overall goal.

Dialogue with the digital coach is a central part of the solution. For example, the user should be able to say that a trip will limit training opportunities in the coming week, that available equipment has changed, or that their energy level calls for an adjustment. The conversation must have a visible consequence in the training program, not merely result in general advice alongside the plan. If the user only has time for two strength sessions, the coach might, for example, suggest two full-body sessions rather than a plan that assumes several separate sessions.

At onboarding, users should be able to choose the coach's communication style — for example, supportive and positive, or more direct and challenging. The tone should adapt to the user's preferences, while safety and recovery considerations are always respected. Relevant information should be remembered across conversations and tied to the correct user, so that the coaching feels personal and consistent over time.

The intended effect is less administration, easier replanning, and a more cohesive training experience. Users should spend less time organizing their training and more time actually doing it.

## What Makes This Different

What sets Flex PT apart from many current alternatives is the combination of flexible planning, a coach that knows the user's context, and support for multiple training types within one coherent solution. The value lies not in the chatbot alone, but in the connection between the conversation, the training history, and the current training plan.

Compared to a standard program, users should not have to make every adjustment manually. Compared to several specialized apps, the goal is to reduce fragmentation. Compared to a general-purpose chatbot, relevant training information should persist over time, and changes should be incorporated directly into the training program. Flex PT therefore addresses the need for flexible, readily available support that makes it easier to fit training into the rest of everyday life.

The solution is not intended to replace the professional and human follow-up a physical personal trainer can offer in every situation. It is primarily meant to be an accessible option for users who want structure and personal adaptation but prefer to organize and carry out their training on their own.

## Who This Serves

The primary user is a fitness-minded person with a busy or shifting daily schedule who wants progress and structure without being tied to a rigid weekly program. The user is comfortable with digital services and willing to log sessions and give brief feedback. Needs and usage patterns matter more than age.

A typical user combines work or studies with social activities and training. They roughly know what they want to achieve but need help translating that ambition into realistic sessions. The need is both practical and motivational: what should be prioritized this week, and how can training continue when the original plan cannot be carried out?

Success, from the user's perspective, means it is easy to find the next relevant session, complete it, and adjust the rest of the week as needed. A week with less training than planned should still feel meaningful. Beginners may also benefit from the solution, but initial testing should focus on users who can articulate a concrete training goal. People who require medical evaluation or specialized health-related follow-up are not the primary target group for the first version.

## Success Criteria

The functional minimum is that the user can create an account, receive a goal-adapted training program, log a completed session, and receive an updated suggestion. In addition, the chatbot must function as a personal trainer and retain relevant user context over time.

To make the criteria measurable, a pilot with ten users over four weeks is proposed. The setup and target values below are suggestions for how the solution can be validated.

| Signal | Measurement or evidence | Proposed target | When measured |
| --- | --- | --- | --- |
| User outcome | Test user creates a profile, receives a plan, and adapts it to a changed week without help. | At least 8 of 10 complete it. | First user test |
| Usage and value | User logs training and returns to update or adjust the plan. | At least 6 of 10 are active in at least 3 of 4 weeks. | Weekly during the pilot |
| Quality and trust | Agreed tests of stored context, separated user data, and program changes are carried out. | All critical tests pass before pilot start. | Before the pilot and after significant changes |
| Continuation | Users assess whether the service makes training easier to plan and follow up on. | At least 7 of 10 want to continue after the pilot. | At pilot end |

Completion rate among test users and their perceived planning effort should also be tracked, relative to each user's situation at the start. A small pilot can give indications of usability and interest but cannot document long-term health outcomes.

## Scope

### In scope for the first version

The first version will be a web-based minimum viable product (MVP) that tests the full user journey from creating a profile to receiving an updated training plan. Five core capabilities are prioritized:

1. **Account and persistent profile:** The user can log in and store goals, experience, availability, equipment, and preferred coaching style. This information must persist for the correct user between visits.
2. **Personal training plan:** The user receives a realistic, achievable training plan based on the information in their profile.
3. **Manual session logging:** The user can log completed training and relevant feedback, so the plan is built on actual activity.
4. **Coach dialogue and adaptation:** The user can communicate changed goals, time constraints, and energy levels, and the digital coach can propose concrete changes to the plan.
5. **Follow-up and progression:** The service suggests further progression based on completed sessions and current circumstances, and shows the updated plan clearly.

Safe handling of personal data is a fundamental requirement. Before testing, the team must clarify which data is necessary, how it will be protected, and what data, if any, is shared with external services.

### Out of scope for the first version

*Flagged by the team as needing feedback on whether it is too ambitious to include within the available time.*

Automatic import of training sessions from third-party services such as Strava, Apple Health, and Garmin Connect is of interest to explore, but is not required for the first version to function.

Calendar integration, including importing appointments and exporting training sessions, is also a desired feature. In the first version, it is sufficient for the user to state availability manually, so that the core value can be tested without external integrations.

Later versions may also include specialized training programs related to the menstrual cycle and pregnancy, as well as features for nutrition tracking and planning. Such features require dedicated assessment of professional quality, safety, and handling of health data.

Game mechanics, reward systems, and subscription management may be considered at a later stage, but are not required to demonstrate the core value of the product.

## Vision

Over a two-to-three-year horizon, the vision is to develop Flex PT into a unified digital training partner that receives information about completed sessions directly from third-party apps such as Strava, Apple Health, and Garmin Connect. This would remove the need for manual activity logging, and the training plan could update based on what was actually completed.

The solution should also be able to use calendar information to suggest which days and times are best suited for training, and which types of sessions make sense on a given day. Planned training sessions should be able to be added directly to the user's calendar.

In the longer term, the solution could also offer concrete nutrition advice based on the user's goals, training load, and daily life. Further development should be guided by the needs pilot users actually experience, documented value, and practical feasibility.

The overarching vision is a personal training partner that knows the user's goals, tracks progress over time, and makes it easier to balance training with the rest of life.
