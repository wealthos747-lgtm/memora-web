// auto-converted from Prompts.java
const Prompts = {


    transcribe(ctx, parts) {
        return "You are a meticulous professional transcriptionist.\n"
                + "The attached audio " + (parts > 1 ? "files are " + parts + " consecutive parts" : "file is a recording") + " of ONE classroom lecture recorded on a phone placed in the classroom.\n"
                + ctx + "\n"
                + "Produce a COMPLETE, faithful, near-verbatim transcript of everything that is said.\n"
                + "Rules:\n"
                + "1. Never summarise, shorten or skip anything — every sentence, example, number, name, question and answer must be in the transcript.\n"
                + "2. Write in the language actually spoken. English stays English. If the speaker mixes in Tamil or another language, write those words as spoken.\n"
                + "3. Label speakers in bold at the start of a paragraph: **Teacher:** for the main lecturer, **Student:** (or **Student 1:**, **Student 2:**) for others, **Guest:** if someone else presents.\n"
                + "4. Start EVERY paragraph with a timestamp in exactly this form: [P1 MM:SS] where the number after P is the part number and MM:SS is the time measured from the start of THAT part (use [P1 H:MM:SS] after one hour).\n"
                + "5. Start a new paragraph at least every 45–60 seconds and whenever the speaker changes.\n"
                + "6. If the teacher writes or dictates something (a definition, formula, list), keep it word-for-word.\n"
                + "7. KEEP every question, answer, comment and discussion between students and the teacher, and every class discussion — label each speaker. Skip only private chatter between students that is not addressed to the teacher or the class, phone calls, and background noise. Mark unclear words as [inaudible]; note long breaks as [break].\n"
                + "8. Output only the transcript, no introduction or closing remarks.";
    },

    summary(ctx, bookmarks, lang) {
        return "You are an expert academic note-taker. Create study notes for a student who will NOT listen to this class again, so the notes must capture EVERYTHING that was taught.\n\n"
                + ctx + "\n" + bookmarks + "\n"
                + "Write the notes in " + lang + " using clean Markdown.\n"
                + "Goal: completeness over brevity. Every concept, definition, framework, model, formula, example, case study, statistic, name, story, question and answer from the class must appear. Explain each point clearly enough to study from. Never invent anything that was not said; if something was unclear in the audio, say so briefly.\n\n"
                + "Use exactly this structure:\n"
                + "# <short descriptive title of what the class was about>\n"
                + "## At a glance\n4–6 sentences: what the class covered and the main takeaway.\n"
                + "## Topics covered\nNumbered list of the topics in the order they were taught.\n"
                + "## Detailed notes\nFor EACH topic, in teaching order, a ### heading followed by thorough bullet points and sub-bullets: the explanation, the teacher's reasoning, examples given, and any remarks. Put **key terms** in bold. Add the approximate timestamp like (≈ 12:30) after each ### heading.\n"
                + "## Key terms & definitions\n- **Term** — definition as explained in class\n"
                + "## Examples & case studies\nEvery example, company, story or case mentioned, with what it illustrated.\n"
                + "## ⭐ Marked important\nFor each moment the student marked (if any), what was being discussed at that time and why it matters. Also list everything the teacher explicitly stressed (\"important\", \"note this\", \"exam\", \"remember\").\n"
                + "## Questions asked in class\n**Q:** … **A:** … for every question raised by students or the teacher.\n"
                + "## Assignments, deadlines & announcements\nHomework, readings, submissions, dates, next-class plans. Write \"None mentioned\" if there were none.\n"
                + "## Exam focus\nThe most likely exam / interview questions from this class, with one-line answer hints.\n"
                + "## Quick revision\n10–15 crisp one-line points to revise in two minutes.\n\n"
                + "Output only the Markdown notes.";
    },

    narration(lang) {
        return "Turn the class notes below into a spoken audio script in " + lang + " that the student will listen to while travelling, instead of reading the notes.\n"
                + "Rules:\n"
                + "- Keep EVERY point, example, definition, question and announcement from the notes. Do not shorten, merge away or skip anything. It is fine if the script is long.\n"
                + "- Write natural, flowing spoken sentences in a warm, clear, teacher-like tone, as if personally explaining the class to the student.\n"
                + "- Begin with: \"Here is your Memora recap of\" followed by the class name, then a one-line overview.\n"
                + "- Use clear spoken transitions such as \"Next topic.\", \"An important point here.\", \"For example,\" so the listener never gets lost.\n"
                + "- Read the 'Marked important' points with emphasis, and end with the quick revision points and any assignments or deadlines.\n"
                + "- Plain text only: no markdown, no symbols, no emojis, no bullet characters, no tables, no timestamps. Spell out abbreviations the first time.\n"
                + "- Separate ideas into short paragraphs.\n"
                + "Output only the script.";
    },

    langDesc(langName) {
        if (langName.toLowerCase().includes("tanglish"))
            return "Tanglish — the Tamil language written in English (Latin) letters, in the natural, casual spoken style used in Tamil Nadu, keeping English technical terms in English";
        return langName;
    },

    translateNotes(langName) {
        return "Translate the following Markdown study notes into " + Prompts.langDesc(langName) + ".\n"
                + "- Translate everything fully. Do not shorten, summarise or drop any point.\n"
                + "- Keep the exact Markdown structure (headings, lists, bold, timestamps).\n"
                + "- For technical terms, write the translated term followed by the English term in brackets when it helps understanding.\n"
                + "- Use simple, natural, easy-to-understand language.\n"
                + "Output only the translated Markdown.";
    },

    translateScript(langName) {
        return "Translate the following spoken audio script into " + Prompts.langDesc(langName) + ".\n"
                + "- Keep every sentence and point; do not shorten.\n"
                + "- It will be read aloud by a voice engine, so write natural spoken language, plain text only, no symbols, no markdown, short paragraphs.\n"
                + "- Keep English technical terms where a listener would expect them.\n"
                + "Output only the translated script.";
    },

    transcribeMeeting(ctx, parts) {
        return "You are a meticulous professional transcriptionist.\n"
                + "The attached audio " + (parts > 1 ? "files are " + parts + " consecutive parts" : "file is a recording") + " of ONE meeting recorded on a phone.\n"
                + ctx + "\n"
                + "Produce a COMPLETE, faithful, near-verbatim transcript of everything that is said.\n"
                + "Rules:\n"
                + "1. Never summarise, shorten or skip anything — every point, number, name, date, commitment, question and answer must be in the transcript.\n"
                + "2. Write in the language actually spoken. If speakers mix Tamil or another language with English, write those words as spoken.\n"
                + "3. Label every speaker in bold at the start of a paragraph. Use the person's real name when it is clear (they introduce themselves, are addressed by name, or match the attendee list); otherwise use **Speaker 1:**, **Speaker 2:** consistently.\n"
                + "4. Start EVERY paragraph with a timestamp in exactly this form: [P1 MM:SS] where the number after P is the part number and MM:SS is the time from the start of THAT part (use [P1 H:MM:SS] after one hour).\n"
                + "5. New paragraph whenever the speaker changes, and at least every 60 seconds.\n"
                + "6. Mark unclear words as [inaudible]. Skip silence, unrelated background noise and side conversations of people who are not part of the meeting.\n"
                + "7. Output only the transcript.";
    },

    meeting(ctx, bookmarks, openTasks, lang, me, today) {
        return "You are an expert executive assistant. From the meeting transcript below, prepare the complete meeting outputs.\n\n"
                + ctx + "\n" + bookmarks + "\n"
                + "Today's date: " + today + ". The user (who recorded the meeting and will send the email) is: " + (me.length > 0 ? me : "the user") + ".\n\n"
                + (openTasks.length > 0 ? "OPEN FOLLOW-UP TASKS from earlier meetings (each has an id):\n" + openTasks + "\nFor each of these tasks that was discussed in THIS meeting, report its new status. Mark it done ONLY if the transcript clearly says it is completed/closed.\n\n" : "")
                + "Write everything in " + lang + ". Be complete and specific: real names, numbers, dates and commitments. Never invent anything that was not said; write 'Not mentioned' where needed.\n\n"
                + "Return ONLY a JSON object with exactly these keys:\n"
                + "{\n"
                + "  \"title\": short meeting title (max 8 words),\n"
                + "  \"summary\": Markdown string — '## Summary' (5–8 sentence overview), '## Key discussion points' (detailed bullets by topic, with approx timestamps like (≈ 12:30)), '## Decisions' (bullets), '## Risks & open questions', '## Next steps',\n"
                + "  \"mom\": Markdown string — formal Minutes of Meeting: '# Minutes of Meeting', a details list (Title, Date, Type, Attendees, Recorded by), '## Agenda' as a table | # | Agenda item | Status (Completed / Partly done / Pending) | Outcome |, '## Discussion' (per agenda item / topic, concise but complete, with who said what), '## Decisions', '## Action items' as a table | # | Action | Owner | Due date | Status |, '## Follow-ups from earlier meetings' (only if open tasks were given), '## Next meeting',\n"
                + "  \"agenda\": [ { \"item\": string, \"status\": \"done\" | \"partial\" | \"pending\", \"note\": short outcome } ] — use the given agenda if any, otherwise infer the agenda from the discussion,\n"
                + "  \"actions\": [ { \"task\": clear actionable task, \"owner\": person's name or \"\", \"due\": \"YYYY-MM-DD\" or \"\" } ] — every commitment and to-do from the meeting, PLUS one follow-up task for every agenda item that is not fully completed. Resolve relative dates ('next Friday') using today's date,\n"
                + "  \"followups\": [ { \"id\": id of an open task above, \"status\": \"done\" | \"open\", \"note\": what was said about it } ] — [] if none were discussed,\n"
                + "  \"email\": { \"subject\": email subject, \"body\": plain-text email the user can send to all attendees: greeting, one-line purpose, short summary, decisions, action items with owner and due date, pending agenda items for next meeting, polite sign-off with the user's name }\n"
                + "}";
    },

    narrationMeeting(lang) {
        return "Turn the meeting summary and minutes below into a spoken audio recap in " + lang + " for the user to listen to while travelling.\n"
                + "- Keep every decision, action item (with owner and due date), pending agenda item and follow-up. Do not skip anything.\n"
                + "- Natural, clear spoken sentences; begin with \"Here is your Memora recap of\" and the meeting name.\n"
                + "- Plain text only: no markdown, symbols, tables, emojis or timestamps. Short paragraphs.\n"
                + "Output only the script.";
    },

    quiz() {
        return "Create revision material from the class notes and transcript below, so the student can test themselves.\n"
                + "Return ONLY a JSON object: {\n"
                + "  \"questions\": 10 to 15 multiple-choice questions covering ALL main topics, each { \"q\": question, \"options\": [4 options], \"answer\": index 0-3 of the correct option, \"why\": one-line explanation from the class },\n"
                + "  \"cards\": 12 to 20 flashcards for key terms, definitions, frameworks and examples, each { \"front\": short prompt, \"back\": crisp answer }\n"
                + "}\nUse only what was taught. Mix easy and exam-level questions. Write in English.";
    },

    pack(subject, range, n) {
        const week = ("week" === range);
        return "You are an expert tutor. Below are the notes of " + n + " classes of the subject \"" + subject + "\"" + (week ? " from the last 7 days" : "") + ".\n"
                + "Write ONE complete " + (week ? "weekly recap" : "study guide") + " in clean Markdown, organised by TOPIC (not by class), merging repeated material.\n"
                + "Keep every concept, definition, framework, example and announcement — completeness over brevity.\n"
                + "Structure: '# " + subject + (week ? " — This week" : " — Study guide") + "', '## Classes covered' (list with dates), '## Topic map' (how topics connect), then a '##' section per topic with detailed bullets and (Class N) references, '## Key terms', '## Assignments & deadlines', '## Likely exam questions' (with answer hints), '## 2-minute revision'.\n"
                + "Output only the Markdown.";
    },

    fromAudio(layout) {
        return "\nSOURCE: the recording itself is attached below as consecutive audio parts (there is no transcript). Listen to ALL parts fully before writing.\n"
                + layout
                + "TIMESTAMPS: whenever you give a time, write it as [P2 12:30] — the part number and the time inside that part. Use this instead of the (≈ 12:30) form.\n"
                + "Include every question, answer and discussion with the teacher / main speakers. Ignore only private side chatter not addressed to the class, phone calls, background noise and long silences.\n";
    },

    classBook(ctx, bookmarks, lang) {
        return "You are a brilliant teacher and textbook writer. Using the full class transcript below, write a CLASS BOOK: a chapter that lets the student feel they attended the class and understand every part of it clearly. (Questions and exam practice go in a separate Q&A Bank — do not include them here.)\n\n"
                + ctx + "\n" + bookmarks + "\n"
                + "Write in " + lang + ", in clean Markdown. Follow the class in the exact order it was taught. Include EVERY concept, example, story, number and name from the class. Never invent facts; any simpler explanation of your own goes under 'In simple words'.\n\n"
                + "Structure:\n"
                + "# <chapter title>\n"
                + "> one-line promise of what the reader will be able to do after this chapter\n"
                + "## The class at a glance\nA short paragraph setting the scene: who taught, what it was about, how the session flowed (start → middle → end).\n"
                + "## What you will learn\n4–8 learning objectives.\n"
                + "## The lesson, step by step\nFor each part of the class in teaching order, a '### Step N — <topic> (≈ time)' section with:\n"
                + "- **What was taught:** the teacher's explanation in full, quoting the important lines in quotation marks\n"
                + "- **In simple words:** a plain explanation a beginner instantly gets\n"
                + "- **Example from class:** the example(s) used, or a clearly labelled simple example if none\n"
                + "- **From the discussion:** any point a student raised on this step and how the teacher responded (omit if none)\n"
                + "- **Why it matters:** where this is used in real work / exams\n"
                + "- a '> **Remember:**' line with the one thing never to forget\n"
                + "## How it all connects\nAn indented bullet concept map of the whole class.\n"
                + "## Key terms\nA Markdown table | Term | Meaning | Example |.\n"
                + "## Assignments, deadlines & announcements\n"
                + "## One-page revision sheet\n12–20 crisp lines covering the whole class.\n"
                + "Output only the Markdown.";
    },

    qaBank(ctx, lang) {
        return "Using the full class transcript below, write a Q&A BANK for this class in " + lang + ", in clean Markdown. It is the student's companion to the Class Book: everything asked or discussed in class, plus exam practice.\n\n"
                + ctx + "\n"
                + "Never invent what was said in class. Exam answers must be based on what was taught.\n\n"
                + "Structure:\n"
                + "# Q&A Bank — <class topic>\n"
                + "## Asked in class\nEVERY question raised in the class — by students or by the professor — in order, each as:\n'### Q<n>. <question> (≈ time)' then '**Asked by:** Student / Professor', then '**Answer given in class:**' with the full answer in clear words, then '**In short:**' one line.\n"
                + "## Class discussions\nEach discussion, debate, opinion round or case discussion: the question discussed, the main points students raised, and the professor's conclusion.\n"
                + "## Exam practice\n"
                + "### Short-answer questions (8) — each with a 3–5 line model answer\n"
                + "### Long-answer questions (4) — each with a structured model answer (intro, points with examples, conclusion)\n"
                + "### MCQs (10) — options a–d, then the answer and one-line reason\n"
                + "### Application / case questions (2) — with model answers using the class examples\n"
                + "### Rapid-fire viva (10) — one-line question → one-line answer\n"
                + "## How to write strong answers on this topic\n4–6 practical tips (keywords to use, diagrams/frameworks to draw, common mistakes).\n"
                + "Output only the Markdown.";
    },

    replay(lang) {
        return "Recreate this class as a realistic CLASSROOM REPLAY audio script in " + lang + ", so the listener feels they are sitting in the class again.\n"
                + "Two speakers only, written exactly as:\nTeacher: ...\nStudent: ...\n"
                + "- The Teacher re-teaches the whole class in the SAME ORDER and with the SAME content, examples, stories and emphasis as the real class, in a warm, engaging, natural spoken style.\n"
                + "- The Student asks the questions that were really asked in class, plus short natural clarifying questions where a learner would get confused; the Teacher answers clearly.\n"
                + "- Keep every concept, definition, key example, number and announcement, but say each thing ONCE, crisply — no repetition, no filler, no admin talk.\n"
                + "- LENGTH: about 1,800–2,400 words in total (a 12–16 minute listen). Spend the words on the ideas that matter most for understanding and exams.\n"
                + "- Mark the important / exam points clearly ('This is important for your exam…').\n"
                + "- End with the Teacher summarising the key takeaways and any homework.\n"
                + "- Spoken words only: no markdown, no stage directions, no sound effects, no timestamps, no headings.\n"
                + "Output only the script lines.";
    },

    cuts(meeting) {
        return "You are a careful audio editor. Below is the time-stamped transcript of a " + (meeting ? "meeting" : "class") + " recording.\n"
                + "List ONLY the time ranges that should be CUT to make a clean, focused version.\n"
                + "CUT only:\n"
                + "- breaks / waiting time / setup (mic, projector, laptop fiddling)\n"
                + "- PRIVATE side conversations between people near the phone that are NOT addressed to the " + (meeting ? "meeting" : "teacher or the class") + "\n"
                + "- phone calls, unrelated chatter, attendance / roll call, long dead air\n"
                + "ALWAYS KEEP (never cut):\n"
                + "- everything the " + (meeting ? "main speakers say about the agenda" : "teacher teaches, explains, writes or announces") + "\n"
                + "- EVERY question asked to the " + (meeting ? "group" : "professor") + ", every answer, every discussion, debate, opinion, case discussion or group activity involving the " + (meeting ? "participants" : "professor or the class") + "\n"
                + "- jokes or stories that are part of the " + (meeting ? "discussion" : "lesson") + "\n"
                + "If you are not sure whether something is side talk or a real question/discussion, KEEP it. Cut whole sentences only, with a little margin.\n"
                + "Return ONLY JSON: { \"cuts\": [ { \"start\": \"H:MM:SS or MM:SS\", \"end\": \"H:MM:SS or MM:SS\", \"reason\": short } ] } using the transcript's timestamps; { \"cuts\": [] } if nothing should be cut.";
    },

};
