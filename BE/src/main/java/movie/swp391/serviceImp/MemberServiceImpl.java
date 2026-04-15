package movie.swp391.serviceImp;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.entity.*;
import movie.swp391.entity.*;
import movie.swp391.exception.AppException;
import movie.swp391.exception.ErrorHandler;
import movie.swp391.mapper.AccountMapper;
import movie.swp391.mapper.CustomerMapper;
import movie.swp391.mapper.ViewScoreHistory;
import movie.swp391.repository.*;
import movie.swp391.repository.*;
import movie.swp391.request.member.UpdateProfileRequest;
import movie.swp391.response.AccountResponse;
import movie.swp391.response.CalculateScoreAndRankResponse;
import movie.swp391.response.CustomerResponse;
import movie.swp391.response.ViewScoreHistoryResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.MemberService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class MemberServiceImpl implements MemberService {

    AccountRepository accountRepo;
    ProfileEditLogRepository logRepo;
    CustomerRepository customerRepository;
    ScoreHistoryRepository scoreHistoryRepository;
    private final CustomerMapper customerMapper;
    ViewScoreHistory viewScoreHistoryMapper;
    AccountMapper accountMapper;
    LoyaltyTierRepository loyaltyTierRepository;

    private static final Logger log = LoggerFactory.getLogger(MemberServiceImpl.class);
    @Override
    public ResponseEntity<BaseResponse<Void>> editProfile(String username, UpdateProfileRequest req) {
        Account acc = accountRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        try {
            acc.getCustomer().setFullName(req.getFullName());
            acc.getCustomer().setDob(req.getDateOfBirth());
            acc.getCustomer().setSex(req.getSex());
            acc.getCustomer().setIdentityCard(req.getIdentityCard());
            acc.getCustomer().setEmail(req.getEmail());
            acc.getCustomer().setPhone(req.getPhoneNumber());
            acc.getCustomer().setAddress(req.getAddress());


            accountRepo.save(acc);
            ProfileEditLog log = new ProfileEditLog(null, acc.getAccountID(), LocalDateTime.now(), "SUCCESS");
            logRepo.save(log);

            return ResponseEntity.ok(new BaseResponse<>("Update information successfully", true, null));
        } catch (Exception e) {
            // Ghi log lỗi
            ProfileEditLog log = new ProfileEditLog(null, acc.getAccountID(), LocalDateTime.now(), "FAIL: " + e.getMessage());
            logRepo.save(log);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BaseResponse<>("Update failed", false, null));
        }
    }

    @Override
    public List<AccountResponse> getAllAccounts() {
        List<Account> accounts = accountRepo.findAll();
        return accounts.stream()
                .map(accountMapper::toAccountResponse)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional
    public BaseResponse<String> setAccountActiveStatus(Integer accountId, Boolean active) {
        try {
            Account account = accountRepo.findById(accountId)
                    .orElseThrow(() -> new AppException(ErrorHandler.USER_NOT_EXISTED));

            if (account.getRole().getRoleName().equals("ADMIN") && !active) {
                return new BaseResponse<>("Không thể khóa tài khoản admin", false, null);
            }

            account.setActive(active);
            accountRepo.save(account);

            String statusMessage = active ? "kích hoạt" : "khóa";
            return new BaseResponse<>("Đã " + statusMessage + " tài khoản thành công", true, null);
        } catch (AppException e) {
            return new BaseResponse<>(e.getMessage(), false, null);
        } catch (Exception e) {
            log.error("Error setting account active status: {}", e.getMessage());
            return new BaseResponse<>("Có lỗi xảy ra khi cập nhật trạng thái tài khoản", false, null);
        }
    }
    @Override
     public CustomerResponse viewCustomerProfile(Integer customerId){
        CustomerResponse   customerResponse = customerRepository.findById(customerId).map(customerMapper::toCustomerResponse).orElseThrow(() -> new AppException(ErrorHandler.USER_NOT_EXISTED));
        return customerResponse;
    }

    @Override
    public List<ViewScoreHistoryResponse> viewScoreHistory(Integer accountID) {
        List<ScoreHistory> histories = scoreHistoryRepository.findAllByCustomer_CustomerID(accountID);

        return histories.stream().map(sh -> {
            String movieName = "";
            if (sh.getCustomer() != null && sh.getCustomer().getBookings() != null) {

                Optional<TicketBooking> recentBooking = sh.getCustomer().getBookings().stream()
                        .filter(b -> b.getBookingDate() != null && !b.getBookingDate().isAfter(sh.getDate()))
                        .sorted(Comparator.comparing(TicketBooking::getBookingDate).reversed())
                        .findFirst();
                if (recentBooking.isPresent()) {
                    movieName = recentBooking.get().getMovieTitle();
                }
            }

            return ViewScoreHistoryResponse.builder()
                    .scoreID(sh.getScoreID())
                    .dateCreate(sh.getDate())
                    .movieName(movieName)
                    .actionType(sh.getActionType())
                    .amount(sh.getAmount())
                    .build();
        }).collect(Collectors.toList());
    }



    @Override
    @Transactional
    public CalculateScoreAndRankResponse recalculateCustomerScores(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorHandler.CUSTOMER_NOT_FOUND));
        if (customer.getFinalScore() == null) {
            customer.setFinalScore(0);
            customerRepository.save(customer);
        }

        Integer total = scoreHistoryRepository.findAllByCustomer_CustomerID(customerId)
                .stream()
                .mapToInt(history -> {
                    if ("plus".equalsIgnoreCase(history.getActionType())) {
                        return history.getAmount();
                    } else if ("minus".equalsIgnoreCase(history.getActionType())) {
                        return -history.getAmount();
                    } else {
                        return 0;
                    }
                })
                .sum();

        Integer totalFinal = scoreHistoryRepository.findAllByCustomer_CustomerID(customerId)
                .stream()
                .mapToInt(history -> {
                    if ("plus".equalsIgnoreCase(history.getActionType()) && !"Đổi điểm khi hết đồ ăn thức uống".equalsIgnoreCase(history.getNote()) ) {
                        return history.getAmount();
                    }
                    else return 0;
                })
                .sum();

        customer.setFinalScore(totalFinal);
        customer.setScore(total);
        customerRepository.save(customer);


        List<LoyaltyTier> tiers = loyaltyTierRepository.findAllByIsActiveTrue()
                .stream()
                .sorted(Comparator.comparingInt(LoyaltyTier::getPointThreshold))
                .toList();

        LoyaltyTier selected = null;

        for (int i = 0; i < tiers.size(); i++) {
            LoyaltyTier current = tiers.get(i);
            LoyaltyTier next = (i + 1 < tiers.size()) ? tiers.get(i + 1) : null;
            if (customer.getFinalScore() >= current.getPointThreshold()
                    && (next == null || customer.getFinalScore() < next.getPointThreshold())) {
                selected = current;
                break;
            }
        }

        customer.setLoyaltyTier(selected);
        customerRepository.save(customer);
        return CalculateScoreAndRankResponse.builder()
                .scores(total)
                .rankName(customer.getLoyaltyTier() != null ? customer.getLoyaltyTier().getName() : "Không có xếp hạng")
                .rankImage(customer.getLoyaltyTier() != null ? customer.getLoyaltyTier().getRankLink() : "không có ảnh xếp hạng")
                .finalScores(totalFinal)
                .build();
    }

}


