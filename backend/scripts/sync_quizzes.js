import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const quizBank = {
  lesson0: [
    {
      prompt: 'What is a computer?',
      options: ['A device that solves problems and helps us learn', 'A type of game', 'A book', 'None of these'],
      answer: 0,
      explanation: 'A computer is an electronic device that helps us solve problems, learn, play games, and connect with others.',
    },
    {
      prompt: 'Which of these is a type of computer?',
      options: ['Desktop', 'Laptop', 'Smartphone', 'All of the above'],
      answer: 3,
      explanation: 'Computers can be desktops, laptops, tablets, or smartphones — they all do the same basic job in different sizes!',
    },
    {
      prompt: 'What are the four basic parts every computer has?',
      options: ['Input devices, output devices, system unit, and storage', 'Screen, keyboard, mouse, and power', 'CPU, RAM, motherboard, and fan', 'Monitor, printer, speaker, and cable'],
      answer: 0,
      explanation: 'Every computer has input devices, output devices, a system unit, and storage — these are the main parts that work together.',
    },
    {
      prompt: 'True or False: Software is the physical parts of a computer that you can touch.',
      options: ['True', 'False'],
      answer: 1,
      explanation: 'False! Software is the programs that tell the computer what to do. Hardware is the physical parts you can touch.',
    },
    {
      prompt: 'What connects millions of computers around the world?',
      options: ['A very long cable', 'The internet', 'A power strip', 'Bluetooth signals'],
      answer: 1,
      explanation: 'The internet is a global network that connects millions of computers so people can share information worldwide.',
    },
  ],
  lesson1: [
    {
      prompt: 'What is an input device?',
      options: ['A tool that displays results on screen', 'A tool we use to send information to the computer', 'A part that stores files', 'A cable that powers the computer'],
      answer: 1,
      explanation: 'Input devices are tools we use to send information to the computer — like keyboards, mice, and microphones.',
    },
    {
      prompt: 'Which input device do you use to type letters and numbers?',
      options: ['Mouse', 'Monitor', 'Keyboard', 'Printer'],
      answer: 2,
      explanation: 'A keyboard is an input device with letter keys, number keys, and special keys that you press to type.',
    },
    {
      prompt: 'What does a microphone do?',
      options: ['Displays sound on a screen', 'Prints documents', 'Converts your voice into digital sound', 'Stores files on the computer'],
      answer: 2,
      explanation: 'A microphone converts your voice into digital sound that the computer can record or understand.',
    },
    {
      prompt: 'True or False: A touchscreen is only an input device.',
      options: ['True', 'False'],
      answer: 1,
      explanation: 'False! A touchscreen is BOTH input and output — it displays images AND accepts your taps and swipes.',
    },
    {
      prompt: 'What is a scanner used for?',
      options: ['Playing music', 'Taking pictures of paper documents and turning them into files', 'Making copies', 'Recording videos'],
      answer: 1,
      explanation: 'A scanner takes a picture of paper documents and turns them into digital files on the computer.',
    },
  ],
  lesson2: [
    {
      prompt: 'What is an output device?',
      options: ['A tool you use to send information to the computer', 'A device that shows you the results from the computer', 'A cable that powers the computer', 'A file storage device'],
      answer: 1,
      explanation: 'Output devices let the computer share results with us — we can see pictures and text, or hear sounds.',
    },
    {
      prompt: 'Which device displays text, images, and videos on a screen?',
      options: ['Printer', 'Monitor', 'Speaker', 'Keyboard'],
      answer: 1,
      explanation: 'A monitor (or screen) displays everything you do on the computer — from homework to games.',
    },
    {
      prompt: 'What device plays music and sounds from the computer?',
      options: ['Keyboard', 'Mouse', 'Speakers', 'Scanner'],
      answer: 2,
      explanation: 'Speakers play music, sound effects, and voice from the computer out loud for everyone to hear.',
    },
    {
      prompt: 'True or False: A printer is an output device.',
      options: ['True', 'False'],
      answer: 0,
      explanation: 'True! A printer is an output device — it takes information FROM the computer and puts it on paper.',
    },
    {
      prompt: 'What output device lets you listen to sound privately?',
      options: ['Microphone', 'Headphones', 'Monitor', 'Keyboard'],
      answer: 1,
      explanation: 'Headphones let you listen to sound privately without disturbing others around you.',
    },
  ],
  lesson3: [
    {
      prompt: 'What is the CPU often called?',
      options: ['The heart', 'The brain', 'The memory', 'The storage'],
      answer: 1,
      explanation: 'The CPU is called the brain of the computer because it processes all instructions and makes decisions.',
    },
    {
      prompt: 'What does RAM stand for?',
      options: ['Read And Memory', 'Random Access Memory', 'Rapid Application Module', 'Read Access Module'],
      answer: 1,
      explanation: 'RAM stands for Random Access Memory — it is the short-term memory that helps the computer work fast.',
    },
    {
      prompt: 'True or False: RAM keeps your files forever, even when the computer is off.',
      options: ['True', 'False'],
      answer: 1,
      explanation: 'False! RAM is short-term memory. It only holds data while the computer is on. Storage keeps files forever.',
    },
    {
      prompt: 'What part connects all the internal components of the computer together?',
      options: ['Power cable', 'USB port', 'Motherboard', 'Cooling fan'],
      answer: 2,
      explanation: 'The motherboard is the main circuit board that connects the CPU, RAM, storage, and all other parts together.',
    },
    {
      prompt: 'What keeps the computer parts cool?',
      options: ['The monitor', 'Cooling fans and heat sinks', 'The keyboard', 'The power supply'],
      answer: 1,
      explanation: 'Fans and heat sinks keep the parts cool so they do not overheat when the computer is running.',
    },
  ],
  lesson4: [
    {
      prompt: 'What do storage devices do?',
      options: ['Display information on a screen', 'Keep your files even when the power is off', 'Connect to the internet', 'Play music and videos'],
      answer: 1,
      explanation: 'Storage devices keep files even when the computer is off so you can open them later.',
    },
    {
      prompt: 'Which storage device uses spinning metal disks?',
      options: ['SSD', 'USB Flash Drive', 'Hard Drive (HDD)', 'Cloud Storage'],
      answer: 2,
      explanation: 'A Hard Drive (HDD) uses spinning metal disks called platters to read and write data.',
    },
    {
      prompt: 'True or False: An SSD has no moving parts.',
      options: ['True', 'False'],
      answer: 0,
      explanation: 'True! SSDs use electronic chips instead of spinning parts, making them faster and quieter than HDDs.',
    },
    {
      prompt: 'What is a USB flash drive?',
      options: ['A device that displays video', 'A small, portable device for carrying files', 'A monitor cable', 'A type of printer'],
      answer: 1,
      explanation: 'A USB flash drive is small and portable — you can put it on a keychain and carry your files anywhere!',
    },
    {
      prompt: 'Where does cloud storage save your files?',
      options: ['On a USB drive', 'On the internet', 'Inside the monitor', 'On a CD'],
      answer: 1,
      explanation: 'Cloud storage saves files on servers connected to the internet so you can access them from anywhere.',
    },
  ],
  lesson5: [
    {
      prompt: 'What should you do before using a computer?',
      options: ['Eat a snack', 'Wash your hands', 'Turn off the lights', 'Play a game first'],
      answer: 1,
      explanation: 'Always wash your hands before using a computer to keep it clean and prevent damage.',
    },
    {
      prompt: 'How should you unplug a computer cable?',
      options: ['Pull it hard and fast', 'Unplug it gently', 'Never unplug it', 'Use scissors to cut it'],
      answer: 1,
      explanation: 'Always unplug cables gently. Pulling hard can damage the cable and the port.',
    },
    {
      prompt: 'True or False: You should shut down the computer by unplugging it from the wall.',
      options: ['True', 'False'],
      answer: 1,
      explanation: 'False! Always shut down properly using the Start menu. Never just unplug it — that can damage files.',
    },
    {
      prompt: 'How often should you take a break from the screen?',
      options: ['Every 5 hours', 'Every 30 minutes', 'Never', 'Only when tired'],
      answer: 1,
      explanation: 'Take a 5-10 minute break every 30 minutes to rest your eyes and stretch!',
    },
    {
      prompt: 'What should you do if a computer looks broken or makes a strange noise?',
      options: ['Try to fix it yourself', 'Ask an adult for help', 'Keep using it', 'Ignore it'],
      answer: 1,
      explanation: 'If something looks broken or makes a strange noise, do not try to fix it yourself — ask an adult for help.',
    },
  ],
}

const lessonMap = {
  lesson0: 2, // General Introduction to Computers
  lesson1: 3, // Input Devices
  lesson2: 4, // Output Devices
  lesson3: 5, // Basic Operations and the Windows Operating System
  lesson4: 6, // Getting Started with the Internet and Email
  lesson5: 7, // Computer Safety and Care
}

async function syncQuizzes() {
  try {
    console.log('🔄 Syncing quizzes from quiz.js to database...\n')

    for (const [lessonKey, questions] of Object.entries(quizBank)) {
      const lessonId = lessonMap[lessonKey]
      console.log(`📚 Processing ${lessonKey} (Lesson ${lessonId})...`)

      // Get or create quiz for this lesson
      const conn = await pool.getConnection()
      try {
        // Get existing quiz
        const [quizzes] = await conn.query('SELECT id FROM quizzes WHERE lesson_id = ?', [lessonId])
        let quizId

        if (quizzes.length === 0) {
          // Create new quiz
          const [result] = await conn.query('INSERT INTO quizzes (lesson_id, passing_score) VALUES (?, ?)', [
            lessonId,
            70,
          ])
          quizId = result.insertId
          console.log(`   ✨ Created new quiz (ID: ${quizId})`)
        } else {
          quizId = quizzes[0].id
          // Delete existing questions
          await conn.query('DELETE FROM questions WHERE quiz_id = ?', [quizId])
          console.log(`   🗑️  Cleared old questions from quiz ${quizId}`)
        }

        // Add new questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]
          const letters = ['A', 'B', 'C', 'D']
          const correctLetter = letters[q.answer]

          await conn.query(
            'INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              quizId,
              q.prompt,
              q.options[0],
              q.options[1],
              q.options[2] || '',
              q.options[3] || '',
              correctLetter,
              q.explanation,
            ]
          )
        }
        console.log(`   ✅ Added ${questions.length} questions\n`)
      } finally {
        conn.release()
      }
    }

    console.log('✨ Quiz sync complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error syncing quizzes:', error.message)
    process.exit(1)
  }
}

syncQuizzes()
