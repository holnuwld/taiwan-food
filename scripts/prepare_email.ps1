param (
    [string]$ToAddress = ""
)

try {
    # Check if Outlook is running
    $outlookProc = Get-Process outlook -ErrorAction SilentlyContinue
    if (-not $outlookProc) {
        Start-Process "outlook.exe"
        Start-Sleep -Seconds 3
    }

    $outlook = New-Object -ComObject Outlook.Application
    $mail = $outlook.CreateItem(0)
    if ($ToAddress) {
        $mail.To = $ToAddress
    }
    $mail.Subject = "[대만 타이베이 3박 4일] 프리미엄 여행 계획서 v3 (데스크탑 / 모바일 PDF 첨부)"
    $mail.Body = "안녕하세요!`r`n`r`n대만 타이베이 3박 4일 여행 계획서 v3 PDF 파일(데스크탑 및 모바일 버전)을 첨부하여 보내드립니다.`r`n`r`n[첨부 파일 안내]`r`n1. taipei_3n4d_dashboard_v3.pdf (12.0 MB) - 데스크탑 & 고화질 인쇄용 대시보드`r`n2. taipei_travel_plan_mobile_v3.pdf (8.6 MB) - 모바일 최적화 스마트폰용 일정표`r`n`r`n즐겁고 안전한 여행 되시길 바랍니다!"
    
    $desktopPdf = (Resolve-Path "output/taipei_3n4d_dashboard_v3.pdf").Path
    $mobilePdf = (Resolve-Path "output/taipei_travel_plan_mobile_v3.pdf").Path
    
    $mail.Attachments.Add($desktopPdf) | Out-Null
    $mail.Attachments.Add($mobilePdf) | Out-Null
    
    $mail.Display($false)
    Write-Output "SUCCESS: Outlook compose window opened with both PDFs attached."
} catch {
    Write-Output "OUTLOOK_COM_ERROR: $($_.Exception.Message)"
}
