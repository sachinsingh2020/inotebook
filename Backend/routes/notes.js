const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser")
const Note = require("../models/Note");
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { Schema } = mongoose;

//Route 1: Get All the Notes using: GET "api/notes/fetchallnotes". login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route 2: Add a New note using: POST "api/notes/addnotes". login required
router.post('/addnotes', fetchuser, [
    body('title', 'Enter a Valid Title').isLength({ min: 3 }),
    body('description', "Description must be atleast 5 characters").isLength({ min: 5 }),
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;

        // if there are errors then return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })



        const saveNote = await note.save()

        res.json(saveNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


})

//Route 3: Update an existing note using: PUT "api/notes/updatenotes". login required
router.put('/updatenotes/:id', fetchuser, async (req, res) => {

    try {
        const { title, description, tag } = req.body;

        // Create a newNote Object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //Find the note to be updated and update it
        let reqParams = req.params;
        let note = await Note.findOne({ reqParams });
        if (!note) { return res.status(404).send("Not Found") };

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

//Route 4: Delete an existing note using: DELETE "api/notes/deletenotes". login required
router.delete('/deletenotes/:id', fetchuser, async (req, res) => {

    try {



        //Find the note to be delete and delete it
        let reqParams = req.params;
        let note = await Note.findOne({ reqParams });
        if (!note) { return res.status(404).send("Not Found") };

        //Allow deletion if only user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": " Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})


module.exports = router

