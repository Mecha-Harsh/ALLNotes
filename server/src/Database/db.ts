import {Pool} from "pg";

const pool =  new Pool({
    user:"harsh",
    host:"localhost",
    database:"exp1",
    password:"h@123",
    port:5432

});

export default pool;