import PageHeader from "@/components/PageHeader";
import NoticeBox from "@/components/NoticeBox";
import SettingsTabs from "./SettingsTabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageHeader title="マスタ管理" description="書類・手続き・対象者区分・判定ルールを確認します。" />
      <SettingsTabs />
      <div className="mb-4">
        <NoticeBox variant="info">
          各マスタ・ルールは追加・編集・削除できます。候補表示ルールや判定ルールを変更すると、書類候補一覧・必要度判定にすぐ反映されます。
        </NoticeBox>
      </div>
      {children}
    </div>
  );
}
