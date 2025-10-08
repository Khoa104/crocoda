const bcrypt = require('bcrypt');
const supabase = require("./supabase");
async function generateHash() {
  const password = "newuser";
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:", hashedPassword);
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  console.log("Hashed password:", isPasswordValid);
  
//   const { data: _user, error } = await supabase
//       .from("users")
//       .select("*")
//       .eq("email", "finance1@example.com")
//       .eq("status","active")
//       .single();
//   console.log(_user)
//   if (error || !_user) {
//       console.log("Invalid credentials" );
//     }
}

generateHash();
