FullStackAI-Suite

Role: Full Stack / AI Intern
Focus: Applied AI for Sustainable Commerce
Objective: Build AI-powered modules to automate cataloging, B2B proposals, impact reporting, and customer support via WhatsApp.

Table of Contents

Project Overview

Modules Implemented

Architecture Overview

AI Prompt Design

Tech Stack

Deployment

Usage

Project Overview

FullStackAI-Suite is a full-stack web application integrating AI to assist sustainable commerce operations. It reduces manual effort, generates structured proposals, and provides automated support, ensuring business logic is grounded in real data.

The application is structured, production-ready, and demonstrates practical AI-assisted workflows.

Modules Implemented

1. AI Auto-Category & Tag Generator

Auto-assigns primary category from a predefined list

Suggests sub-categories

Generates 5–10 SEO tags

Suggests sustainability filters (plastic-free, compostable, vegan, recycled, etc.)

Returns structured JSON output and stores it in the database

2. AI B2B Proposal Generator

Suggests sustainable product mix

Budget allocation within limits

Provides estimated cost breakdown

Generates impact positioning summary

Returns structured JSON output

3. AI WhatsApp Support Bot

Answers order status queries using real database data

Handles return policy questions

Escalates high-priority or refund-related issues

Logs AI conversations

Module 3 (AI Impact Reporting Generator) is outlined for future implementation.

Architecture Overview

[Frontend: React + Material UI + Axios] <---> [Backend: Node.js + Express + MongoDB] <---> [AI: OpenAI API or Custom Logic]

Frontend: React with Material UI for responsive chat interfaces and AI interaction forms

Backend: Node.js + Express handles API routes, authentication (JWT), and database logic

Database: MongoDB for storing products, proposals, and chat logs

AI Integration: OpenAI API used to generate structured JSON outputs, proposals, and responses

Deployment: Backend hosted on Render, frontend deployed on Vercel

Flow Example:

User submits a product description → Backend validates input → Sends prompt to AI → Receives structured response → Saves to DB → Displays response in frontend.

AI Prompt Design

Auto-Category Prompt:

Input: Product description
Task: Suggest primary category, sub-category, 5-10 SEO tags, sustainability filters
Output: JSON format

B2B Proposal Prompt:

Input: Event/Requirement description and budget
Task: Generate suggested product mix, budget allocation, cost breakdown, and impact statement
Output: JSON format

Support Bot Prompt:

Input: User query regarding order
Task: Respond using database info, handle return/refund queries
Output: User-friendly text response

All prompts are dynamic and logged for traceability and future improvement.

Tech Stack

Frontend: React, Material UI, Axios, React Router

Backend: Node.js, Express.js, JWT Authentication

Database: MongoDB

AI: OpenAI API / Custom AI Logic

Deployment: Vercel (frontend), Render (backend)

Deployment

Backend (Render): https://fullstackai-suite.onrender.com

Frontend (Vercel): https://full-stack-ai-suite.vercel.app

Make sure to set environment variables for API keys and backend URLs in both Render and Vercel.

Usage

Open the frontend URL

Access the modules:

Auto-Category: Input product descriptions and generate categories/tags

Proposal Generator: Input event/product requests and get AI proposals

WhatsApp Support: Ask order-related queries

Click “Send” or relevant action buttons to interact with AI
