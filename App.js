import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, TouchableWithoutFeedback } from "react-native";
import { Accelerometer } from "expo-sensors";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 20;

const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 40;

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);
  const [bullets, setBullets] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    Accelerometer.setUpdateInterval(10);
    const sub = Accelerometer.addListener(({ x }) => {
      setPlayerX(prev => {
        let newX = prev + x * 30;
        if (newX < 0) newX = 0;
        if (newX > screenWidth - PLAYER_WIDTH) newX = screenWidth - PLAYER_WIDTH;
        return newX;
      });
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBullets(prev =>
        prev
          .map(b => ({ ...b, y: b.y + 10 }))
          .filter(b => b.y < screenHeight)
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const blockX = Math.random() * (screenWidth - BLOCK_WIDTH);
      setBlocks(prev => [
        ...prev,
        { id: Date.now().toString(), x: blockX, y: screenHeight }
      ]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prev =>
        prev
          .map(block => ({ ...block, y: block.y - 15 }))
          .filter(block => block.y > 0)
      );

      checkCollisions();
    }, 50);

    return () => clearInterval(interval);
  }, [bullets, blocks]);

  const handleFire = () => {
    setBullets(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        x: playerX + (PLAYER_WIDTH - BULLET_WIDTH) / 2,
        y: PLAYER_HEIGHT
      }
    ]);
  };

  const checkCollisions = () => {
    setBlocks(prevBlocks =>
      prevBlocks.filter(block => {
        let hit = false;

        bullets.forEach(bullet => {
          if (
            bullet.x < block.x + BLOCK_WIDTH &&
            bullet.x + BULLET_WIDTH > block.x &&
            bullet.y < block.y + BLOCK_HEIGHT &&
            bullet.y + BULLET_HEIGHT > block.y
          ) {
            hit = true;
          }
        });

        return !hit;
      })
    );

    blocks.forEach(block => {
      if (
        playerX < block.x + BLOCK_WIDTH &&
        playerX + PLAYER_WIDTH > block.x &&
        20 < block.y + BLOCK_HEIGHT &&
        20 + PLAYER_HEIGHT > block.y
      ) {
        setGameOver(true);
      }
    });
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverText}>GAME OVER</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleFire}>
      <View style={styles.container}>

        {bullets.map(bullet => (
          <View
            key={bullet.id}
            style={[styles.bullet, { left: bullet.x, bottom: bullet.y }]}
          />
        ))}

        {blocks.map(block => (
          <View
            key={block.id}
            style={[styles.fallingBlock, { left: block.x, top: screenHeight - block.y }]}
          />
        ))}

        <View style={[styles.player, { left: playerX }]} />
        <Text style={styles.instruction}>Tilt your phone to move • Tap to shoot</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60
  },
  player: {
    position: "absolute",
    bottom: 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#000"
  },
  instruction: {
    position: "absolute",
    top: 70,
    color: "#fff",
    fontFamily: "Courier",
    fontSize: 14
  },
  bullet: {
    position: "absolute",
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    backgroundColor: "#FFF"
  },
  fallingBlock: {
    position: "absolute",
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    backgroundColor: "white"
  },
  gameOverText: {
    fontSize: 32,
    color: "#fff",
    fontFamily: "Courier",
    fontWeight: "bold"
  }
});
