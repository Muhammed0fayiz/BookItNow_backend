import app from './app'
import dotenv from 'dotenv'
import userRoutes from './presentation/routes/userRoutes'
 
import { connectDatabase } from './infrastructure/db/dbConnection'
import adminRoutes from './presentation/routes/adminRoutes';
import performerRoutes from './presentation/routes/performerRoutes'


dotenv.config();

connectDatabase()
const port = process.env.PORT || 5001;


app.use('/',userRoutes)
app.use('/',performerRoutes)
app.use('/',adminRoutes)



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });