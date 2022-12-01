#!/usr/bin/env sh

# 验证commit-msg 是否正确
# 获取当前提交的 commit msg
commit_msg=`cat "$1"`

# --froce 强制提交
if [[ $commit_msg =~ "--force" ]]
  then
    echo -e "\033[33m -- 强制提交 --\033[0m"
# Merge 生成的commit msg 不进行校验 直接提交
elif [[ $commit_msg =~ "Merge" ]]
  then
    echo -e "\033[33m -- 忽略Merge提交 --\033[0m"
# 提交内容太短
elif [ ${#commit_msg} -lt 10 ]  
  then
    echo -e "\033[31m -------------------------------------------------------------------\033[0m"
    echo -e "\033[31m 提交失败! \033[0m"
    echo -e "\033[31m 提交信息: $commit_msg \033[0m"
    echo -e "\033[31m 提交信息只有${#commit_msg}字符 \033[0m"
    echo -e "\033[31m 提交信息的长度不能小于10, 请完善后再提交 \033[0m"
    echo -e "\033[31m -------------------------------------------------------------------\033[0m"
    exit 1
# 提交必须包含类型
elif [[ ! $commit_msg =~ "feat:" ]] && 
   [[ ! $commit_msg =~ "fix:" ]] &&
   [[ ! $commit_msg =~ "style:" ]] &&
   [[ ! $commit_msg =~ "refactor:" ]] &&
   [[ ! $commit_msg =~ "docs:" ]] &&
   [[ ! $commit_msg =~ "test:" ]] &&
   [[ ! $commit_msg =~ "chore:" ]]
then
    echo -e "\033[31m -------------------------------------------------------------------\033[0m"
    echo -e "\033[31m 提交失败! \033[0m"
    echo -e "\033[31m 提交信息: $commit_msg \033[0m"
    echo -e "\033[31m 提交信息中必须包含提交类型（feat:|fix:|docs:|style: ...）,参考结构如下: \033[0m"
    echo -e "\033[32m (√) WEB-1000 feat: 新增xx功能 \033[0m"
    echo -e "\033[31m -------------------------------------------------------------------\033[0m"
    exit 1

## 如果不包含'WEB-'则输出提示信息
elif [[ ! $commit_msg =~ "WEB-" ]]
then
    echo -e "\033[31m -------------------------------------------------------------------\033[0m"
    echo -e "\033[31m 提交失败! \033[0m"
    echo -e "\033[31m 提交信息: $commit_msg \033[0m"
    echo -e "\033[31m 提交信息中必须包含 'WEB-',参考结构如下: \033[0m"
    echo -e "\033[32m (√) WEB-1000 feat: 新增xx功能 \033[0m"
    echo -e "\033[31m -------------------------------------------------------------------\033[0m"
    exit 1
fi

echo -e "\033[32m -------------------------------------------------------------------  \033[0m"
echo -e "\033[32m 提交成功! \033[0m"
echo -e "\033[32m 提交信息: $commit_msg \033[0m"
echo -e "\033[32m ------------------------------------------------------------------- \033[0m"
exit 0
