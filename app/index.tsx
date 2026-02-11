import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';

export default function CalculatorScreen() {
  const colorScheme = useColorScheme();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [lastEquation, setLastEquation] = useState<string>('');

  // Theme colors that adapt to system theme
  const themes = {
    light: {
      background: '#F5F5F7',
      display: '#FFFFFF',
      displayText: '#000000',
      displaySecondary: '#666666',
      numberButton: '#FFFFFF',
      numberButtonText: '#000000',
      operatorButton: '#FF9F0A',
      operatorButtonText: '#FFFFFF',
      specialButton: '#E5E5EA',
      specialButtonText: '#000000',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
      background: '#000000',
      display: '#1C1C1E',
      displayText: '#FFFFFF',
      displaySecondary: '#999999',
      numberButton: '#2C2C2E',
      numberButtonText: '#FFFFFF',
      operatorButton: '#FF9F0A',
      operatorButtonText: '#FFFFFF',
      specialButton: '#505050',
      specialButtonText: '#FFFFFF',
      shadow: 'rgba(255, 255, 255, 0.05)',
    },
  };

  const theme = themes[colorScheme ?? 'light'];

  const handleNumberPress = (num: number) => {
    if (shouldResetDisplay) {
      setDisplay(String(num));
      setShouldResetDisplay(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleOperationPress = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
      setLastEquation('');
    } else if (operation) {
      const equation = `${previousValue} ${operation} ${currentValue}`;
      const result = calculateRoughEstimates(previousValue, currentValue, operation);
      setLastEquation(equation);
      setDisplay(result);
      setPreviousValue(null);
      setOperation(null);
    }

    setOperation(op);
    setShouldResetDisplay(true);
  };

  const calculateRoughEstimates = (prev: number, current: number, op: string): string => {
    // Calculate the actual result
    let actualResult: number;
    switch (op) {
      case '+':
        actualResult = prev + current;
        break;
      case '-':
        actualResult = prev - current;
        break;
      case '×':
        actualResult = prev * current;
        break;
      case '÷':
        actualResult = prev / current;
        break;
      default:
        actualResult = current;
    }

    // Check if both inputs are whole numbers
    const inputsAreWholeNumbers = Number.isInteger(prev) && Number.isInteger(current);

    // Generate two rough estimates that are NOT correct
    const variance = Math.abs(actualResult) * 0.15 + 5; // 15% variance plus a base amount

    // First estimate - off by a random amount
    const estimate1 = actualResult + (Math.random() * variance * 2 - variance);

    // Second estimate - off by a different random amount
    const estimate2 = actualResult + (Math.random() * variance * 2 - variance);

    // Round based on whether inputs were whole numbers
    let roundedEstimate1: number;
    let roundedEstimate2: number;

    if (inputsAreWholeNumbers) {
      // If inputs are whole numbers, estimates should also be whole numbers
      roundedEstimate1 = Math.round(estimate1);
      roundedEstimate2 = Math.round(estimate2);
    } else {
      // If inputs have decimals, allow decimal estimates
      roundedEstimate1 = Math.round(estimate1 * 10) / 10;
      roundedEstimate2 = Math.round(estimate2 * 10) / 10;
    }

    return `idk ${roundedEstimate1}, maybe ${roundedEstimate2}?`;
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const currentValue = parseFloat(display);
      const equation = `${previousValue} ${operation} ${currentValue}`;
      const result = calculateRoughEstimates(previousValue, currentValue, operation);
      setLastEquation(equation);
      setDisplay(result);
      setPreviousValue(null);
      setOperation(null);
      setShouldResetDisplay(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setShouldResetDisplay(false);
    setLastEquation('');
  };

  const handlePlusMinus = () => {
    const numValue = parseFloat(display);
    if (!isNaN(numValue)) {
      setDisplay(String(numValue * -1));
    }
  };

  const handlePercent = () => {
    const numValue = parseFloat(display);
    if (!isNaN(numValue)) {
      setDisplay(String(numValue / 100));
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.') && !display.includes('idk')) {
      setDisplay(display + '.');
    }
  };

  interface ButtonProps {
    title: string;
    onPress: () => void;
    type?: 'number' | 'operator' | 'special';
    flex?: number;
    aspectRatio?: number;
  }

  const Button: React.FC<ButtonProps> = ({ title, onPress, type = 'number', flex = 1, aspectRatio = 1 }) => {
    let buttonStyle, textStyle;

    switch (type) {
      case 'operator':
        buttonStyle = [styles.button, { backgroundColor: theme.operatorButton, aspectRatio }];
        textStyle = [styles.buttonText, { color: theme.operatorButtonText }];
        break;
      case 'special':
        buttonStyle = [styles.button, { backgroundColor: theme.specialButton, aspectRatio }];
        textStyle = [styles.buttonText, { color: theme.specialButtonText }];
        break;
      default:
        buttonStyle = [styles.button, { backgroundColor: theme.numberButton, aspectRatio }];
        textStyle = [styles.buttonText, { color: theme.numberButtonText }];
    }

    return (
      <TouchableOpacity
        style={[buttonStyle, { flex }, { shadowColor: theme.shadow }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={textStyle}>{title}</Text>
      </TouchableOpacity>
    );
  };

  // Format display text
  const formatDisplay = () => {
    if (display.includes('idk')) {
      return display; // Already formatted
    }
    const numValue = parseFloat(display);
    if (isNaN(numValue)) {
      return display;
    }
    return numValue.toLocaleString('en-US', { maximumFractionDigits: 8 });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Display */}
      <View style={[styles.displayContainer, { backgroundColor: theme.display }]}>
        {/* Equation input in top right */}
        {operation && previousValue !== null && !display.includes('idk') && (
          <Text style={[styles.equationText, { color: theme.displaySecondary }]}>
            {previousValue} {operation} {display}
          </Text>
        )}
        {/* Show last equation when displaying result */}
        {display.includes('idk') && lastEquation && (
          <Text style={[styles.equationText, { color: theme.displaySecondary }]}>
            {lastEquation}
          </Text>
        )}

        <Text
          style={[
            styles.displayText,
            { color: theme.displayText },
            display.includes('idk') && styles.estimateText
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {formatDisplay()}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <Button title="C" onPress={handleClear} type="special" />
          <Button title="±" onPress={handlePlusMinus} type="special" />
          <Button title="%" onPress={handlePercent} type="special" />
          <Button title="÷" onPress={() => handleOperationPress('÷')} type="operator" />
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <Button title="7" onPress={() => handleNumberPress(7)} />
          <Button title="8" onPress={() => handleNumberPress(8)} />
          <Button title="9" onPress={() => handleNumberPress(9)} />
          <Button title="×" onPress={() => handleOperationPress('×')} type="operator" />
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <Button title="4" onPress={() => handleNumberPress(4)} />
          <Button title="5" onPress={() => handleNumberPress(5)} />
          <Button title="6" onPress={() => handleNumberPress(6)} />
          <Button title="-" onPress={() => handleOperationPress('-')} type="operator" />
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <Button title="1" onPress={() => handleNumberPress(1)} />
          <Button title="2" onPress={() => handleNumberPress(2)} />
          <Button title="3" onPress={() => handleNumberPress(3)} />
          <Button title="+" onPress={() => handleOperationPress('+')} type="operator" />
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <Button title="0" onPress={() => handleNumberPress(0)} flex={2} aspectRatio={2} />
          <Button title="." onPress={handleDecimal} />
          <Button title="=" onPress={handleEquals} type="operator" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  displayContainer: {
    flex: 1.5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  equationText: {
    position: 'absolute',
    top: 24,
    right: 24,
    fontSize: 16,
    fontWeight: '400',
  },
  displayText: {
    fontSize: 64,
    fontWeight: '300',
    letterSpacing: -2,
  },
  estimateText: {
    fontSize: 36, // Smaller to fit the longer text
    textAlign: 'right',
  },
  buttonsContainer: {
    flex: 3,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  button: {
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '400',
  },
});