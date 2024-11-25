import app from './app'
import dotenv from 'dotenv'
import userRoutes from './presentation/routes/userRoutes'
 
import { connectDatabase } from './infrastructure/db/dbConnection'
import adminRoutes from './presentation/routes/adminRoutes';
import performerRoutes from './presentation/routes/performerRoutes'

import paymentRoutes from './presentation/routes/paymentRoutes'
dotenv.config();

connectDatabase()
const port = process.env.PORT || 5001;


app.use('/',userRoutes)
app.use('/performer',performerRoutes)
app.use('/admin',adminRoutes)
app.use('/payment',paymentRoutes)



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });