import AsyncStorage from '@react-native-async-storage/async-storage';

export class KNNClassifier {
  private knnData: Map<string, number[][]> = new Map();

  async loadFromStorage(storageKey: string) {
    try {
      const json = await AsyncStorage.getItem(storageKey);
      if (json) {
        const parsed = JSON.parse(json) as Record<string, number[][]>;
        this.knnData.clear();
        for (const [key, value] of Object.entries(parsed)) {
          this.knnData.set(key, value);
        }
      }
    } catch (err) {
      console.error('Error loading KNN from storage:', err);
    }
  }

  async saveToStorage(storageKey: string) {
    try {
      const obj: Record<string, number[][]> = {};
      for (const [key, value] of this.knnData.entries()) {
        obj[key] = value;
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(obj));
    } catch (err) {
      console.error('Error saving KNN to storage:', err);
    }
  }

  addExample(vector: number[], label: string) {
    if (!this.knnData.has(label)) {
      this.knnData.set(label, []);
    }
    this.knnData.get(label)!.push(vector);
  }

  getNumClasses(): number {
    return this.knnData.size;
  }
  
  getTotalExamples(): number {
    let count = 0;
    for (const vectors of this.knnData.values()) {
      count += vectors.length;
    }
    return count;
  }

  predict(inputVector: number[], k: number = 3): string | null {
    if (this.knnData.size === 0) return null;

    const allExamples: Array<{ label: string; distance: number }> = [];

    for (const [label, vectors] of this.knnData.entries()) {
      for (const exampleVector of vectors) {
        let sum = 0;
        for (let i = 0; i < inputVector.length; i++) {
          const diff = inputVector[i] - exampleVector[i];
          sum += diff * diff;
        }
        allExamples.push({ label, distance: Math.sqrt(sum) });
      }
    }

    allExamples.sort((a, b) => a.distance - b.distance);
    const nearestNeighbors = allExamples.slice(0, Math.min(k, allExamples.length));

    const votes: Record<string, number> = {};
    for (const neighbor of nearestNeighbors) {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    }

    let winnerLabel: string | null = null;
    let maxVotes = -1;

    for (const label in votes) {
      if (votes[label] > maxVotes) {
        maxVotes = votes[label];
        winnerLabel = label;
      }
    }

    return winnerLabel;
  }

  async clear(storageKey: string) {
    this.knnData.clear();
    await AsyncStorage.removeItem(storageKey);
  }
}
