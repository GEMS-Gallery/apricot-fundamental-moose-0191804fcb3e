import React, { useState } from 'react';
import { Container, Paper, Grid, Button, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { backend } from 'declarations/backend';

const CalculatorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: 'auto',
  maxWidth: 300,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 3px 15px rgba(0,0,0,0.2)',
}));

const CalculatorButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  minWidth: '60px',
  minHeight: '60px',
  fontSize: '1.2rem',
}));

const CalculatorDisplay = styled(Typography)(({ theme }) => ({
  width: '100%',
  textAlign: 'right',
  padding: theme.spacing(2),
  fontSize: '1.5rem',
  backgroundColor: theme.palette.grey[200],
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    backend.clear();
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      performCalculation(operator, inputValue);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = async (op: string, secondOperand: number) => {
    if (firstOperand === null) {
      return;
    }

    setLoading(true);
    try {
      const result = await backend.calculate(firstOperand, secondOperand, op);
      if (result !== null) {
        setDisplay(result.toString());
        setFirstOperand(result);
      } else {
        setDisplay('Error');
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setDisplay('Error');
    } finally {
      setLoading(false);
    }
    setOperator(null);
  };

  return (
    <Container>
      <CalculatorPaper elevation={3}>
        <CalculatorDisplay variant="h4" component="div">
          {display}
          {loading && <CircularProgress size={20} style={{ marginLeft: 10 }} />}
        </CalculatorDisplay>
        <Grid container spacing={1}>
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
            <Grid item xs={3} key={btn}>
              <CalculatorButton
                variant="contained"
                color={['/', '*', '-', '+'].includes(btn) ? 'primary' : 'secondary'}
                onClick={() => {
                  if (btn === '=') {
                    if (operator && firstOperand !== null) {
                      performCalculation(operator, parseFloat(display));
                    }
                  } else if (['+', '-', '*', '/'].includes(btn)) {
                    handleOperator(btn);
                  } else if (btn === '.') {
                    inputDecimal();
                  } else {
                    inputDigit(btn);
                  }
                }}
              >
                {btn}
              </CalculatorButton>
            </Grid>
          ))}
          <Grid item xs={12}>
            <CalculatorButton
              variant="contained"
              color="error"
              fullWidth
              onClick={clear}
            >
              Clear
            </CalculatorButton>
          </Grid>
        </Grid>
      </CalculatorPaper>
    </Container>
  );
};

export default App;
