import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    socket_id: {
        type: String,
        required: true
    }
});

export default mongoose.model("User", UserSchema);
