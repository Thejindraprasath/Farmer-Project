import { Loan } from './loan.model';
import { User } from './user.model';

export interface LoanApplication {
    AnnualIncome?: any;
    LoanApplicationId?: number;
    UserId?: number;
    User?: User;
    LoanId?: number;
    Loan?: Loan;
    SubmissionDate: string;
    LoanStatus: number;
    FarmLocation: string;
    FarmerAddress: string;
    FarmSizeInAcres: number;
    FarmPurpose: string;
    File: string;
}