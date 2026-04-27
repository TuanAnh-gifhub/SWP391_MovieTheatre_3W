package movie.swp391.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import movie.swp391.request.member.UpdateProfileRequest;
import movie.swp391.response.*;
import movie.swp391.response.ApiResponse;
import movie.swp391.response.CalculateScoreAndRankResponse;
import movie.swp391.response.CustomerResponse;
import movie.swp391.response.ViewScoreHistoryResponse;
import movie.swp391.response.common.BaseResponse;
import movie.swp391.service.MemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.security.Principal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class MemberController {

    MemberService memberService;
    private final RestClient.Builder builder;

    @Operation(summary = "Edit member profile", description = "Update logged-in user's profile")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Update success"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Server error")
    })
    @PutMapping("/edit-profile-member")
    public ResponseEntity<BaseResponse<Void>> editProfile(
            @RequestBody @Valid UpdateProfileRequest request,
            Principal principal) {
        return memberService.editProfile(principal.getName(), request);
    }


    @GetMapping("/get-score-histories/{customerID}")
    public ApiResponse<List<ViewScoreHistoryResponse>> getListOfScoreHistories(@PathVariable Integer customerID) {
        return ApiResponse.<List<ViewScoreHistoryResponse>>builder()
                .result(memberService.viewScoreHistory(customerID))
                .message("Success")
                .status(200)
                .build();
    }

    @GetMapping("/get-profile-member")
    public ApiResponse<CustomerResponse> getProfileMember(@RequestParam Integer customerID) {
        return ApiResponse.<CustomerResponse>builder()
                .result(memberService.viewCustomerProfile(customerID))
                .message("Success")
                .status(200)
                .build();
    }

    @PostMapping("/get-score-member")
    public ApiResponse<CalculateScoreAndRankResponse> getScoresMember(@RequestParam Integer customerID) {
        return ApiResponse.<CalculateScoreAndRankResponse>builder()
                .result(memberService.recalculateCustomerScores(customerID))
                .message("Success")
                .status(200)
                .build();
    }


}



