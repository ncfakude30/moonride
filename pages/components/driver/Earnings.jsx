import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tw from 'tailwind-styled-components';
import { getPaymentTransactions } from '../../api/api.service';
import { setTransactions, appendTransactions, setLoading, setError } from '../../../store/reducers/paymentSlice';

const Earnings = ({user}) => {
    const dispatch = useDispatch();
    const { transactions, lastEvaluatedKey, hasMore, loading } = useSelector((state) => state.payment);

    const loadTransactions = async (append = false) => {
        if (user) {
            try {
                dispatch(setLoading(true));
                const transactionsResponse = await getPaymentTransactions(user.id, lastEvaluatedKey);
                if (transactionsResponse?.transactions?.length > 0) {
                    if (append) {
                        dispatch(appendTransactions({
                            transactions: transactionsResponse.trips,
                            lastEvaluatedKey: transactionsResponse.lastEvaluatedKey,
                            hasMore: !!transactionsResponse.lastEvaluatedKey,
                        }));
                    } else {
                        dispatch(setTransactions({
                            transactions: transactionsResponse.transactions,
                            lastEvaluatedKey: transactionsResponse.lastEvaluatedKey,
                            hasMore: !!transactionsResponse.lastEvaluatedKey,
                        }));
                    }
                }
            } catch (e) {
                dispatch(setError('Failed to load trips'));
            } finally {
                dispatch(setLoading(false));
            }
        } else {
            dispatch(setLoading(false));
        }
    };

        useEffect(() => {
            loadTransactions();
        }, [user]);

    if (loading && transactions.length === 0) {
        return <LoadingWrapper>
        <Loader />
        <LoadingMessage>Loading transactions...</LoadingMessage>
      </LoadingWrapper>
    }

    return (
        <RecentTransactionsWrapper>
            <TransactionCard className="balance-card">
                <BalanceDetail>
                <BalanceLabel>Total Balance:</BalanceLabel>
                <BalanceValue>{`R 1560`}</BalanceValue>
                </BalanceDetail>
            </TransactionCard>
            <Title>Recent Transactions</Title>
            {transactions.length === 0 ? (
                <NoTransactionsMessage>No transactions found!</NoTransactionsMessage>
            ) : (
                <>
                    {transactions.map(transaction => (
                        <TransactionCard key={transaction?.transactionId} onClick={() => handleTripClick(trip)}>
                            <TransactionDetails>
                                <BadgeWrapper>
                                <StatusBadge status={transaction?.status?.toLowerCase() || 'complete'}>
                                    {transaction?.status?.toUpperCase() || 'SUCCESS'}
                                </StatusBadge>
                                <TransactionDetail>
                                    <TypeValue>{truncateText('IN')}</TypeValue>
                                </TransactionDetail>
                                </BadgeWrapper>
                                
                                <TransactionDetail>
                                    <Label>Amount:</Label>
                                    <BalanceValue>R{truncateText(transaction?.amount)}</BalanceValue>
                                </TransactionDetail>
                                <TransactionDetail>
                                    <Label>Date:</Label>
                                    <Value>{new Date(transaction?.paymentDate).toLocaleDateString()}</Value>
                                </TransactionDetail>
                            </TransactionDetails>
                        </TransactionCard>
                    ))}
                    {hasMore && (
                        <LoadMoreButton onClick={() => loadTransactions(true)}>
                            Load More
                        </LoadMoreButton>
                    )}
                </>
            )}
        </RecentTransactionsWrapper>
    );
    };

const truncateText = (text) => {
    if (!text) return '';
    return text.length > 25 ? `${text.substring(0, 23)}...` : text;
};
export default Earnings;

const LoadingWrapper = tw.div`
  flex flex-col items-center justify-center py-6
`;

const LoadingMessage = tw.div`
  text-gray-700 font-semibold text-center py-4 text-center text-xs py-2
`;

const Loader = tw.div`
  w-16 h-16 border-4 border-dashed rounded-full animate-spin border-gray-500
`;


const RecentTransactionsWrapper = tw.div`
      flex flex-col flex-wrap space-x-2 space-y-2 p-2
`;

const Title = tw.h2`
    text-2l font-bold mb-4 text-gray-800
`;

const TransactionCard = tw.div`
    relative bg-white text-gray-800 rounded-lg p-4 shadow-lg transition-transform transform hover:scale-105 cursor-pointer
    hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
    overflow-hidden border border-gray-200 space-y-4
`;

const BadgeWrapper = tw.div`
    flex justify-between items-center
`;

const StatusBadge = tw.div`
    w-20 h-6 px-1 py-1 text-white text-xs font-bold rounded-full flex items-center justify-center
    ${props => (props.status?.toLowerCase() === 'success' || props.status?.toLowerCase() === 'complete') && 'bg-green-500'}
    ${props => props.status === 'cancelled' && 'bg-blue-500'}
    ${props => props.status === 'pending' && 'bg-gray-500'}
    ${props => props.status === 'failed' && 'bg-red-500'}
`;

const NotificationWrapper = tw.div`
    flex items-center space-x-1
`;

const NotificationLabel = tw.span`
    text-sm font-medium text-gray-700
`;

const NotificationBadge = tw.div`
    w-6 h-6 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full
`;

const TransactionDetails = tw.div`
    flex flex-col space-y-1 mb-4
`;

const BalanceDetail = tw.div`
    flex items-center pb-1
`;

const BalanceDetails = tw.div`
    flex flex-col space-y-1 mb-4
`;

const TransactionDetail = tw.div`
    flex items-center border-gray-200
`;

const Label = tw.span`
    semibold text-gray-600
`;

const Value = tw.span`
    semibold text-gray-800 ml-2 flex-grow text-left
`;

const TypeValue = tw.span`
    font-semibold text-green-800 ml-2 flex-grow text-left
`;

const BalanceLabel = tw.span`
    absolute font-bold text-gray-900
`;

const BalanceValue = tw.span`
    font-semibold text-green-600 ml-2 flex-grow text-center
`;


const NoTransactionsMessage = tw.div`
    text-center text-gray-600 font-medium
`;

const LoadMoreButton = tw.button`
    bg-gradient-to-r from-gray-600 to-gray-400 text-white rounded-full p-4 font-semibold shadow-lg
    hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-300 transition-colors
    focus:outline-none focus:ring-1 focus:ring-gray-600 focus:ring-opacity-25
`;
