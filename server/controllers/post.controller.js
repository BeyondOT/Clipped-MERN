const { now } = require("mongoose");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

/**
 * Returns all the posts
 */
const readPost = (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get data : " + err);
  }).sort({ createdAt: -1 });
};

/**
 * Creates a post.
 * @param {string} req.body.posterId The id of the user that posts.
 * @param {string} req.body.message The message that the user posts.
 */
const createPost = async (req, res) => {
  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    comments: [],
  });
  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};

/**
 * Updates the message of a post.
 * @param {string} req.params.id The id of the post to update.
 * @param {string} req.body.message The updating message.
 */
const updatePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  const updateMessage = { message: req.body.message };
  try {
    let updateResponse = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateMessage },
      { new: true }
    );
    return res.status(200).json(updateResponse);
  } catch (err) {
    return res.status(400).send("Update Error");
  }
};

/**
 * Deletes a post
 * @param {string} req.params.id The id of the post to delete.
 */
const deletePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  try {
    let deleteResponse = await PostModel.findByIdAndDelete(req.params.id);
    return res.status(200).json(deleteResponse);
  } catch (err) {
    return res.status(400).json(err);
  }
};

/**
 * Likes a post.
 * @param {string} req.params.id The id of the post to be liked.
 * @param {string} req.body.likerId The id of the liker of the post.
 * @description Adds the "likerId" to the "likers" posts field. And adds the "id" to the "likes" user field.
 */
const likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    let likedResponse = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.likerId } },
      { new: true }
    );

    let likerResponse = await UserModel.findByIdAndUpdate(
      req.body.likerId,
      { $addToSet: { likes: req.params.id } },
      { new: true }
    );

    return res.status(200).json({ likedResponse, likerResponse });
  } catch (error) {
    return res.status(400).send(error);
  }
};

/**
 * Unlikes a post.
 * @param {string} req.params.id The id of the post to be unliked.
 * @param {string} req.body.unlikerId The id of the liker of the post.
 * @description Removes the "unlikerId" from the "likers" Post field. And removes the "id" from the "likes" User field.
 */
const unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  try {
    let unlikedResponse = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.unlikerId } },
      { new: true }
    );

    let unlikerResponse = await UserModel.findByIdAndUpdate(
      req.body.unlikerId,
      { $pull: { likes: req.params.id } },
      { new: true }
    );
    return res.status(200).json({ unlikedResponse, unlikerResponse });
  } catch (error) {
    return res.status(400).send(error);
  }
};

/**
 * Add a comment to the given post.
 * @param {string} req.params.id The id of the post 
 * @param {string} req.body.commenterId The id of the user that posts the comment
 * @param {string} req.body.commenterPseudo The pseudo of the user that posts the comment
 * @param {string} req.body.text The text of the comment.
 */
const addComment = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  try {
    commentResponse = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: Date.now(),
          },
        },
      },
      { new: true }
    );
    return res.status(201).send(commentResponse);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const editComment = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }
};

const deleteComment = async (req, res) => {};

module.exports = {
  readPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  editComment,
  deleteComment,
};