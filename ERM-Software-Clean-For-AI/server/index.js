import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { knex } from './lib/knex.js'
import prepareDatabase from './scripts/db-prepare.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import workflowRouter from './routes/workflow.js'
import entitiesRouter from './routes/entities.js'
import commentsRouter from './routes/comments.js'
import adminRouter from './routes/admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'
const PORT = Number(process.env.PORT || 8081)

app.use(cors({ 
	origin: function(origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		// Allow localhost on any port
		if (origin.startsWith('http://localhost:')) {
			return callback(null, true);
		}
		
		// Allow the configured origin
		if (origin === ORIGIN) {
			return callback(null, true);
		}
		
		callback(new Error('Not allowed by CORS'));
	}, 
	credentials: true 
}))
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

app.get('/api/health', async (req, res) => {
	try {
		await knex.select(1)
		return res.json({ ok: true, db: 'up' })
	} catch (err) {
		return res.status(500).json({ ok: false, error: 'DB check failed' })
	}
})

app.get('/api/test', (req, res) => {
	res.json({ message: 'Server is working!', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/workflow', workflowRouter)
app.use('/api/entities', entitiesRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/admin', adminRouter)

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
	const clientDir = path.resolve(__dirname, '../dist')
	app.use(express.static(clientDir))
	app.get('*', (req, res) => {
		res.sendFile(path.join(clientDir, 'index.html'))
	})
}

async function start() {
	try {
		// Prepare database before starting server
		await prepareDatabase()
		
		// Start HTTP server
		app.listen(PORT, () => {
			console.log(`🚀 Server listening on http://localhost:${PORT}`)
		})
	} catch (error) {
		console.error('💥 Failed to start server:', error)
		process.exit(1)
	}
}

start().catch((err) => {
	console.error('Fatal startup error:', err)
	process.exit(1)
})


