/* eslint-disable no-console */
const pool = require('./createDatabasePool');

async function getPostById(id) {
  try {
    const [post] = (await pool.query(`
      SELECT
        ps.content AS content,
        g.game_id AS game_id, 
        g.title AS title, 
        g.question_img_url AS question_img_url, 
        g.owner_id AS owner_id, 
        g.row_qty AS row_qty, 
        g.col_qty AS col_qty, 
        g.difficulty AS difficulty, 
        g.mode AS mode, 
        p.puzzles AS puzzles, 
        g.is_public AS is_public, 
        g.is_open_when_owner_not_in AS is_open_when_owner_not_in, 
        g.play_duration AS play_duration, 
        g.is_completed AS is_completed, 
        g.completed_at AS completed_at
      FROM 
        games g
      LEFT JOIN
        posts ps ON ps.game_id = g.game_id
      LEFT JOIN 
        (
          SELECT 
            game_id, 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'puzzle_id', p.puzzle_id, 
                'target_id', p.target_id, 
                'top_ratio', p.top_ratio, 
                'left_ratio', p.left_ratio, 
                'is_locked', p.is_locked, 
                'locked_by', p.locked_by, 
                'locked_color', p.locked_color, 
                'z_index', p.z_index
              )
            ) AS puzzles
          FROM 
            puzzles p
          WHERE 
            is_locked = 1
          GROUP BY 
            game_id
        ) p ON p.game_id = g.game_id
      WHERE 
        g.game_id = (
          SELECT game_id 
          FROM posts 
          WHERE id = ?
        );
    `, [id]))[0];
    return post;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getAllPostByPlayerId(playerId) {
  try {
    const [posts] = await pool.query(`
      SELECT
        ps.content AS content,
        g.game_id AS game_id, 
        g.title AS title, 
        g.question_img_url AS question_img_url, 
        g.owner_id AS owner_id, 
        g.row_qty AS row_qty, 
        g.col_qty AS col_qty, 
        g.difficulty AS difficulty, 
        g.mode AS mode, 
        p.puzzles AS puzzles, 
        g.is_public AS is_public, 
        g.is_open_when_owner_not_in AS is_open_when_owner_not_in, 
        g.play_duration AS play_duration, 
        g.is_completed AS is_completed, 
        g.completed_at AS completed_at
      FROM 
        posts ps
      LEFT JOIN 
        games g ON ps.game_id = g.game_id
      LEFT JOIN 
        (
          SELECT 
            game_id, 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'puzzle_id', p.puzzle_id, 
                'target_id', p.target_id, 
                'top_ratio', p.top_ratio, 
                'left_ratio', p.left_ratio, 
                'is_locked', p.is_locked, 
                'locked_by', p.locked_by, 
                'locked_color', p.locked_color, 
                'z_index', p.z_index
              )
            ) AS puzzles
          FROM 
            puzzles p
          WHERE 
            is_locked = 1
          GROUP BY 
            game_id
        ) p ON p.game_id = g.game_id
      WHERE 
        ps.player_id = ?;
    `, [playerId]);
    console.log(posts);
    return posts;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function addNewPost(info) {
  try {
    const {
      playerId, gameId, content
    } = info;

    const postInfo = [
      playerId, gameId, content
    ];

    const [{ insertId: id }] = await pool.query(`
      INSERT INTO posts (
        player_id, game_id, content
      ) VALUES (
        ?, ?, ?
      )
    `, postInfo);

    const newPost = await getPostById(id);
    return newPost;
  } catch (error) {
    console.error(error);
    return error;
  }
}

module.exports = {
  getAllPostByPlayerId,
  addNewPost
};
